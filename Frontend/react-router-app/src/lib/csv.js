// This file turns real data from the backend into a CSV file
// the user can download. It never invents rows of its own.
// If there is nothing to export, it simply does nothing.

// This function makes one value safe to put inside a CSV cell.
// Commas, quotes and line breaks would otherwise break the file,
// so the value is wrapped in quotes when needed.
function escapeCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// This function builds the CSV text from a list of columns
// and the rows given to it. The first line is the headings,
// and every line after that is one record of real data.
export function toCsv(columns, rows) {
  const header = columns.map((c) => escapeCell(c.label)).join(",");
  const body = (rows || [])
    .map((row) => columns.map((c) => escapeCell(row?.[c.key])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

// This function downloads the CSV in the browser.
// It creates a temporary file link, clicks it, then cleans up.
// It stops early when there are no real rows, so the user
// never downloads an empty or fake file.
export function downloadCsv(filename, columns, rows) {
  if (!rows || rows.length === 0) return false;
  const blob = new Blob([toCsv(columns, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
