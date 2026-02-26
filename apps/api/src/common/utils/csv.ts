/**
 * Convert an array of flat objects to a CSV string.
 *
 * @param rows Array of objects (all must share the same keys)
 * @param columns Optional ordered subset of keys to include
 * @returns UTF-8 CSV string (with BOM for Excel compatibility)
 */
export function toCsv<T extends object>(
  rows: T[],
  columns?: (keyof T & string)[],
): string {
  if (rows.length === 0) return '';

  const keys =
    columns ?? (Object.keys(rows[0] as object) as (keyof T & string)[]);

  const escapeCell = (value: unknown): string => {
    const str = value === null || value === undefined ? '' : String(value);
    // Wrap in quotes if the value contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = keys.join(',');
  const body = rows
    .map((row) =>
      keys
        .map((k) => escapeCell((row as Record<string, unknown>)[k]))
        .join(','),
    )
    .join('\n');

  // UTF-8 BOM for proper Excel rendering of Vietnamese characters
  return `\uFEFF${header}\n${body}\n`;
}
