#!/usr/bin/env python3
"""Extract VTU marks-table rows using complementary PDF table parsers."""
import json
import os
import re
import sys
import tempfile

try:
    import pymupdf.layout
    LAYOUT_AVAILABLE = True
except ImportError:
    LAYOUT_AVAILABLE = False

import pymupdf as fitz


DEBUG_TABLES = os.getenv("DEBUG_MARKS_TABLES") == "1"


def debug_tables(page_number, strategy, tables):
    """Write unmodified table discovery data to stderr for parser diagnosis."""
    if not DEBUG_TABLES:
        return
    print(
        f"[marks debug] page={page_number} strategy={strategy} tables={tables!r}",
        file=sys.stderr,
    )
    for index, table in enumerate(tables):
        raw_rows = table.extract()
        print(
            f"[marks debug] page={page_number} strategy={strategy} table={index} "
            f"rows={raw_rows!r}",
            file=sys.stderr,
        )


def clean(value):
    return " ".join(str(value or "").split())


def parse_total(value):
    text = clean(value)
    if not re.fullmatch(r"\d{1,3}", text):
        return None
    total = int(text)
    return total if 0 <= total <= 100 else None


def extract_table_rows(path):
    """Return ``{subject_code: total}`` rows from tables with matching headers."""
    marks = {}
    document = fitz.open(path)
    try:
        for page in document:
            tables = page.find_tables().tables
            debug_tables(page.number + 1, "lines", tables)
            if not tables:
                # PyMuPDF uses these two settings for text-based table finding.
                tables = page.find_tables(
                    vertical_strategy="text", horizontal_strategy="text"
                ).tables
                debug_tables(page.number + 1, "text", tables)

            for table in tables:
                rows = table.extract()
                if not rows:
                    continue

                # Table headers are read from the first raw row. The columns
                # are located by their labels, never by fixed numeric indexes.
                header = [re.sub(r"[^a-z]", "", clean(cell).lower()) for cell in rows[0]]
                code_index = next(
                    (index for index, value in enumerate(header) if "subjectcode" in value or "coursecode" in value),
                    None,
                )
                total_index = next(
                    (index for index, value in enumerate(header) if "total" in value),
                    None,
                )
                if code_index is None or total_index is None:
                    continue

                for row in rows[1:]:
                    if len(row) <= max(code_index, total_index):
                        continue
                    subject_code = clean(row[code_index])
                    total = parse_total(row[total_index])
                    if subject_code and total is not None:
                        marks[subject_code] = total
    finally:
        document.close()

    if not marks:
        raise ValueError("No valid Subject Code and Total rows were found in the PDF table.")
    return marks


def temporary_marks_path(request_id):
    safe_request_id = re.sub(r"[^A-Za-z0-9_-]", "_", request_id)
    return os.path.join(tempfile.gettempdir(), f"marks_{safe_request_id}.json")


def main():
    mode = "layout-enhanced" if LAYOUT_AVAILABLE else "standard"
    print(f"[marks] table detection mode: {mode}", file=sys.stderr)
    if len(sys.argv) != 3:
        raise ValueError("Expected a PDF path and request id.")
    marks = extract_table_rows(sys.argv[1])
    with open(temporary_marks_path(sys.argv[2]), "w", encoding="utf-8") as output:
        json.dump(marks, output)
    print(json.dumps(marks))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        # stdout remains machine-readable for the Express caller.
        print(json.dumps({"error": str(error)}))
        sys.exit(1)
