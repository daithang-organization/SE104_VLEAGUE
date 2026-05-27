const PAGE_MARGIN = 40;
const CANVAS_SCALE = 2;
const FONT_FAMILY = 'Arial, "Segoe UI", sans-serif';
const TITLE_SIZE = 16;
const META_SIZE = 9;
const HEADER_SIZE = 9;
const BODY_SIZE = 8.5;
const CELL_PADDING_X = 5;
const CELL_PADDING_Y = 4;
const MIN_ROW_HEIGHT = 20;

type Page = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  cursorY: number;
};

type ColumnLayout = {
  align: CanvasTextAlign;
  width: number;
};

function setFont(
  context: CanvasRenderingContext2D,
  size: number,
  weight: '400' | '600' | '700' = '400',
) {
  context.font = `${weight} ${size}px ${FONT_FAMILY}`;
}

function isNumericColumn(rows: string[][], columnIndex: number) {
  return rows.length > 0 && rows.every((row) => /^-?\d+(?:[.,]\d+)?$/.test(row[columnIndex] ?? ''));
}

function createPage(pageWidth: number, pageHeight: number): Page {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(pageWidth * CANVAS_SCALE);
  canvas.height = Math.ceil(pageHeight * CANVAS_SCALE);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not available for PDF export');
  }

  context.scale(CANVAS_SCALE, CANVAS_SCALE);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, pageWidth, pageHeight);
  context.textBaseline = 'middle';

  return { canvas, context, cursorY: PAGE_MARGIN };
}

function drawReportHeader(page: Page, title: string, pageNumber: number) {
  const { context } = page;
  const renderedTitle = pageNumber === 1 ? title : `${title} (tiếp)`;

  context.fillStyle = '#111827';
  setFont(context, TITLE_SIZE, '700');
  context.fillText(renderedTitle, PAGE_MARGIN, page.cursorY + 8);

  context.fillStyle = '#4b5563';
  setFont(context, META_SIZE);
  context.fillText(
    `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
    PAGE_MARGIN,
    page.cursorY + 26,
  );

  page.cursorY += 38;
}

function measureColumnLayouts(
  context: CanvasRenderingContext2D,
  headers: string[],
  rows: string[][],
  tableWidth: number,
): ColumnLayout[] {
  setFont(context, BODY_SIZE);
  const minWidths = headers.map((_, index) => (index === 0 ? 28 : 38));
  const rawWidths = headers.map((header, columnIndex) => {
    const values = [header, ...rows.map((row) => row[columnIndex] ?? '')];
    const measured = values.reduce(
      (max, value) => Math.max(max, context.measureText(value).width + CELL_PADDING_X * 2),
      minWidths[columnIndex],
    );
    return Math.min(measured, tableWidth * 0.38);
  });

  const widths = rawWidths.map((width, index) => Math.max(width, minWidths[index]));
  let totalWidth = widths.reduce((sum, width) => sum + width, 0);

  if (totalWidth > tableWidth) {
    let overflow = totalWidth - tableWidth;
    while (overflow > 0.01) {
      const shrinkable = widths.reduce(
        (sum, width, index) => sum + Math.max(0, width - minWidths[index]),
        0,
      );
      if (shrinkable <= 0) break;

      widths.forEach((width, index) => {
        const capacity = Math.max(0, width - minWidths[index]);
        const shrink = Math.min(capacity, overflow * (capacity / shrinkable));
        widths[index] -= shrink;
      });
      totalWidth = widths.reduce((sum, width) => sum + width, 0);
      overflow = totalWidth - tableWidth;
    }
  } else if (totalWidth < tableWidth) {
    const extra = (tableWidth - totalWidth) / widths.length;
    widths.forEach((_, index) => {
      widths[index] += extra;
    });
  }

  return widths.map((width, index) => ({
    align: index === 0 ? 'center' : isNumericColumn(rows, index) ? 'right' : 'left',
    width,
  }));
}

function wrapText(context: CanvasRenderingContext2D, value: string, maxWidth: number) {
  const text = value.trim() || ' ';
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  const pushLongWord = (word: string) => {
    let segment = '';
    for (const character of word) {
      const candidate = `${segment}${character}`;
      if (segment && context.measureText(candidate).width > maxWidth) {
        lines.push(segment);
        segment = character;
      } else {
        segment = candidate;
      }
    }
    currentLine = segment;
  };

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    if (context.measureText(word).width > maxWidth) {
      pushLongWord(word);
    } else {
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawCellText(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  align: CanvasTextAlign,
  fontSize: number,
) {
  const lineHeight = fontSize * 1.25;
  const textHeight = lines.length * lineHeight;
  const startY = y + (height - textHeight) / 2 + lineHeight / 2;
  const textX =
    align === 'right'
      ? x + width - CELL_PADDING_X
      : align === 'center'
        ? x + width / 2
        : x + CELL_PADDING_X;

  context.textAlign = align;
  lines.forEach((line, index) => {
    context.fillText(line, textX, startY + index * lineHeight, width - CELL_PADDING_X * 2);
  });
}

function drawTableHeader(
  page: Page,
  headers: string[],
  columns: ColumnLayout[],
  tableWidth: number,
) {
  const { context } = page;
  let cursorX = PAGE_MARGIN;

  context.fillStyle = '#001529';
  context.fillRect(PAGE_MARGIN, page.cursorY, tableWidth, MIN_ROW_HEIGHT);
  context.strokeStyle = '#d1d5db';
  context.lineWidth = 0.2;
  context.fillStyle = '#ffffff';
  setFont(context, HEADER_SIZE, '700');

  headers.forEach((header, index) => {
    const column = columns[index];
    context.strokeRect(cursorX, page.cursorY, column.width, MIN_ROW_HEIGHT);
    drawCellText(
      context,
      [header],
      cursorX,
      page.cursorY,
      column.width,
      MIN_ROW_HEIGHT,
      column.align,
      HEADER_SIZE,
    );
    cursorX += column.width;
  });

  page.cursorY += MIN_ROW_HEIGHT;
}

function drawTableRow(page: Page, row: string[], columns: ColumnLayout[], rowHeight: number) {
  const { context } = page;
  let cursorX = PAGE_MARGIN;

  context.fillStyle = '#111827';
  context.strokeStyle = '#d1d5db';
  context.lineWidth = 0.2;
  setFont(context, BODY_SIZE);

  row.forEach((value, index) => {
    const column = columns[index];
    const lines = wrapText(context, value, column.width - CELL_PADDING_X * 2);
    context.strokeRect(cursorX, page.cursorY, column.width, rowHeight);
    drawCellText(
      context,
      lines,
      cursorX,
      page.cursorY,
      column.width,
      rowHeight,
      column.align,
      BODY_SIZE,
    );
    cursorX += column.width;
  });

  page.cursorY += rowHeight;
}

function getRowHeight(context: CanvasRenderingContext2D, row: string[], columns: ColumnLayout[]) {
  setFont(context, BODY_SIZE);
  const maxLines = row.reduce((max, value, index) => {
    const column = columns[index];
    return Math.max(max, wrapText(context, value, column.width - CELL_PADDING_X * 2).length);
  }, 1);
  return Math.max(MIN_ROW_HEIGHT, maxLines * BODY_SIZE * 1.25 + CELL_PADDING_Y * 2);
}

function toPdfFilename(title: string) {
  const safeName = title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${safeName || 'bao-cao'}.pdf`;
}

export async function exportPdf(title: string, headers: string[], rows: string[][]) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ format: 'a4', unit: 'pt' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - PAGE_MARGIN * 2;
  let pageNumber = 1;
  let page = createPage(pageWidth, pageHeight);

  drawReportHeader(page, title, pageNumber);
  const columns = measureColumnLayouts(page.context, headers, rows, tableWidth);
  drawTableHeader(page, headers, columns, tableWidth);

  const flushPage = () => {
    doc.addImage(page.canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);
  };

  rows.forEach((row) => {
    const rowHeight = getRowHeight(page.context, row, columns);
    if (page.cursorY + rowHeight > pageHeight - PAGE_MARGIN) {
      flushPage();
      doc.addPage();
      pageNumber += 1;
      page = createPage(pageWidth, pageHeight);
      drawReportHeader(page, title, pageNumber);
      drawTableHeader(page, headers, columns, tableWidth);
    }

    drawTableRow(page, row, columns, rowHeight);
  });

  flushPage();
  doc.save(toPdfFilename(title));
}
