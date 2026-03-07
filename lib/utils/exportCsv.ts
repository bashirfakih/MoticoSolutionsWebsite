/**
 * CSV Export Utility
 *
 * Exports an array of objects as a CSV file download.
 *
 * @module lib/utils/exportCsv
 */

/**
 * Escape a CSV field value — wraps in quotes if it contains commas, quotes, or newlines.
 */
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => unknown;
}

/**
 * Export data as a CSV file download.
 *
 * @param columns - Column definitions with header name and accessor function
 * @param data - Array of data rows
 * @param filename - Download filename (without .csv extension)
 */
export function exportCsv<T>(
  columns: CsvColumn<T>[],
  data: T[],
  filename: string
): void {
  const headers = columns.map(c => escapeCsvField(c.header)).join(',');
  const rows = data.map(row =>
    columns.map(c => escapeCsvField(c.accessor(row))).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
