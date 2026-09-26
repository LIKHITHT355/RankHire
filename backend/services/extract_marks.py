"""Extract subject totals from a VTU provisional marksheet PDF."""
import json
import re
import sys
from pathlib import Path

SPACE = re.compile(r"\s+")
NUMBER = re.compile(r"(?<![A-Z0-9])(?:100|[1-9]?\d)(?:\.0+)?(?![A-Z0-9])")


class ExtractionError(ValueError):
    """The marks table cannot safely be read from the uploaded PDF."""


def clean(value):
    return SPACE.sub(" ", (value or "").replace("\n", " ")).strip()


def normalized(value):
    return re.sub(r"[^A-Z0-9]", "", clean(value).upper())


def total_from_cell(value):
    text = clean(value)
    if not text or normalized(text) in {"TOTAL", "MARKS", "MAXMARKS"}:
        return None
    values = [float(item) for item in NUMBER.findall(text)]
    if len(values) != 1 or not 0 <= values[0] <= 100:
        return None
    return int(values[0]) if values[0].is_integer() else values[0]


def header_columns(rows):
    """Find subject-name and Total columns, despite wrapped VTU headers."""
    for index, row in enumerate(rows):
        cells = [normalized(cell) for cell in row]
        joined = " ".join(cells)
        if not ("SUBJECT" in joined or "COURSE" in joined) or "TOTAL" not in joined:
            continue
        name = next((i for i, cell in enumerate(cells) if ("SUBJECT" in cell and "CODE" not in cell) or "COURSENAME" in cell or cell == "COURSE"), None)
        total = next((i for i, cell in enumerate(cells) if "TOTAL" in cell), None)
        # Some provisional result cards label column one only as "Course".
        if name is not None and total is not None:
            return index, name, total
    return None


def parse_table(table):
    """Normalize multiline cells and return only course-name/total records."""
    rows = [[clean(cell) for cell in row] for row in table if row and any(clean(cell) for cell in row)]
    header = header_columns(rows)
    if not header:
        return []
    start, name_col, total_col = header
    subjects, pending = [], None
    for row in rows[start + 1:]:
        name = clean(row[name_col] if name_col < len(row) else "")
        total = total_from_cell(row[total_col] if total_col < len(row) else "")
        # Skips headers, subtotal rows, SGPA/CGPA notes, and incomplete rows.
        if not name or total is None or not re.search(r"[A-Za-z]", name):
            continue
        if normalized(name) in {"SGPA", "CGPA", "RESULT", "TOTAL"}:
            continue
        subjects.append({"name": name, "total": total})
    return subjects


def ocr_table_fallback(pages):
    """Last-resort OCR for image-only PDFs; never used for text-based PDFs."""
    try:
        import pytesseract
    except ImportError as error:
        raise ExtractionError("The PDF is image-only and OCR is required, but pytesseract is not installed.") from error
    # OCR output is intentionally not trusted as a table. Tell the caller to
    # enter values manually unless a future OCR-table parser can validate it.
    ocr_text = "\n".join(pytesseract.image_to_string(page.to_image(resolution=300).original) for page in pages)
    if ocr_text.strip():
        raise ExtractionError("The PDF is image-only. OCR found text but could not safely reconstruct its marks table; enter totals manually.")
    raise ExtractionError("The PDF contains no readable marks table. OCR is required before totals can be extracted.")


def extract_subject_totals(file_path):
    """Extract grid-table totals without mistaking a watermark for missing text.

    OCR is considered only when *no* table is found and no page contains
    embedded character objects. An empty ``extract_text()`` result alone is
    never an OCR signal.
    """
    import pdfplumber

    all_tables, subjects, pages = [], [], []
    has_embedded_chars = False
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            pages.append(page)
            has_embedded_chars = has_embedded_chars or bool(page.chars)
            tables = page.extract_tables() or []
            if not tables:
                tables = page.extract_tables({"vertical_strategy": "text", "horizontal_strategy": "text"}) or []
            all_tables.extend(tables)
            for table in tables:
                subjects.extend(parse_table(table))
        # Keep pages alive only while pdfplumber is open; OCR must run here.
        if not all_tables and not has_embedded_chars:
            return ocr_table_fallback(pdf.pages)
    if not all_tables:
        raise ExtractionError("No table grid was found, although the PDF has embedded text. Please upload the original provisional marksheet or enter totals manually.")
    unique = {(normalized(subject["name"]), subject["total"]): subject for subject in subjects}
    if not unique:
        raise ExtractionError("A table was found but no valid Subject Name and Total / 100 rows could be read. Please enter totals manually.")
    return list(unique.values())


def main():
    if len(sys.argv) != 2:
        raise ValueError("Expected one marksheet path")
    file_path = Path(sys.argv[1])
    if file_path.suffix.lower() != ".pdf":
        raise ExtractionError("Only PDF marksheets are supported by this extractor.")
    print(json.dumps({"subjects": extract_subject_totals(file_path)}))


if __name__ == "__main__":
    try:
        main()
    except ExtractionError as error:
        print(str(error), file=sys.stderr)
        sys.exit(2)
