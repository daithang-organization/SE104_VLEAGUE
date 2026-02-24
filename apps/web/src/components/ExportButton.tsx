import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

type Column = {
  title: string;
  key: string;
};

type Props = {
  columns: Column[];
  dataSource: Record<string, unknown>[];
  filename?: string;
};

function escapeCSV(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportButton({ columns, dataSource, filename = 'export' }: Props) {
  const handleExport = () => {
    // BOM for UTF-8 in Excel
    const bom = '\uFEFF';
    const header = columns.map((c) => escapeCSV(c.title)).join(',');
    const rows = dataSource.map((row) => columns.map((c) => escapeCSV(row[c.key])).join(','));
    const csv = bom + [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      icon={<DownloadOutlined />}
      size="small"
      onClick={handleExport}
      disabled={dataSource.length === 0}
    >
      Xuất CSV
    </Button>
  );
}
