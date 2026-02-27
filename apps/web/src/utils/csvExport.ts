/**
 * Utility to export tabular data as CSV and trigger browser download
 */
export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel
  const csvContent =
    BOM +
    [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a sample CSV template for player import
 */
export function downloadPlayerCsvTemplate() {
  const headers = [
    'fullName',
    'dob',
    'nationality',
    'position',
    'playerType',
    'birthPlace',
    'heightCm',
    'weightKg',
  ];
  const sample = [
    ['Nguyễn Văn A', '2000-01-15', 'Vietnam', 'FW', 'DOMESTIC', 'Hà Nội', '175', '68'],
    ['John Doe', '1995-06-20', 'Brazil', 'MF', 'FOREIGN', 'São Paulo', '180', '75'],
  ];
  exportToCsv('mau_import_cau_thu.csv', headers, sample);
}
