import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockPdfExport = vi.hoisted(() => {
  let pageSize = { width: 595, height: 842 };
  const doc = {
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    internal: {
      pageSize: {
        getWidth: () => pageSize.width,
        getHeight: () => pageSize.height,
      },
    },
  };

  return {
    autoTable: vi.fn(),
    doc,
    jsPDF: vi.fn(function jsPDF(options?: { orientation?: string }) {
      pageSize =
        options?.orientation === 'landscape'
          ? { width: 842, height: 595 }
          : { width: 595, height: 842 };
      return doc;
    }),
  };
});

const mockCanvas = vi.hoisted(() => {
  const context = {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 2.5 })),
    moveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
  };

  return {
    context,
    toDataURL: vi.fn(() => 'data:image/png;base64,report-page'),
  };
});

const mockStandingsApi = vi.hoisted(() => ({
  apiGetTopScorers: vi.fn().mockResolvedValue([
    {
      playerId: 'p1',
      playerName: 'Nguyễn Tiến Linh',
      teamName: 'Bình Dương',
      position: 1,
      goals: 12,
    },
  ]),
  apiGetTopAssists: vi.fn().mockResolvedValue([
    {
      playerId: 'p2',
      playerName: 'Player Assist',
      teamName: 'Ha Noi FC',
      position: 1,
      assists: 6,
    },
  ]),
  apiGetCardStats: vi.fn().mockResolvedValue([]),
  apiGetTeamStats: vi.fn().mockResolvedValue([
    {
      teamName: 'Hà Nội FC',
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      goalsFor: 20,
      goalsAgainst: 5,
      goalDifference: 15,
      points: 25,
    },
    {
      teamName: 'MerryLand Quy Nhơn Bình Định',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    },
  ]),
}));

vi.mock('jspdf', () => ({ default: mockPdfExport.jsPDF }));
vi.mock('jspdf-autotable', () => ({ default: mockPdfExport.autoTable }));
vi.mock('../../services/standingsApi', () => mockStandingsApi);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../../components', () => ({
  TableSkeleton: () => <div>Loading...</div>,
}));
// Mock sub-tab components
vi.mock('../reports/TopScorersTab', () => ({
  default: ({ data }: { data: unknown[] }) => <div>TopScorers: {(data as unknown[]).length}</div>,
}));
vi.mock('../reports/CardStatsTab', () => ({ default: () => <div>CardStats</div> }));
vi.mock('../reports/TeamStatsTab', () => ({ default: () => <div>TeamStats</div> }));
vi.mock('../reports/ChartsTab', () => ({ default: () => <div>Charts</div> }));

import ReportsPage from '../ReportsPage';

function renderPage() {
  return render(<ReportsPage />);
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: vi.fn(() => mockCanvas.context),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      value: mockCanvas.toDataURL,
    });
  });

  it('renders title', () => {
    const { container } = renderPage();
    expect(screen.getByText('reports.title')).toBeInTheDocument();
    expect(container.querySelector('.page-hero-compact')).toBeInTheDocument();
  });

  it('shows loaded report counts in the hero metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('fetches all data on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockStandingsApi.apiGetTopScorers).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetTopAssists).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetCardStats).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetTeamStats).toHaveBeenCalled();
    });
  });

  it('renders tab labels', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('reports.tabScorers')).toBeInTheDocument();
    });
  });

  it('renders export buttons', () => {
    renderPage();
    expect(screen.getByText('reports.exportScorersPdf')).toBeInTheDocument();
    expect(screen.getByText('reports.exportTeamStatsPdf')).toBeInTheDocument();
  });

  it('renders Vietnamese text into PDF image pages when exporting scorers', async () => {
    renderPage();

    const button = screen.getByRole('button', { name: /reports.exportScorersPdf/ });
    await waitFor(() => expect(button).not.toBeDisabled());
    fireEvent.click(button);

    await waitFor(() => expect(mockPdfExport.doc.addImage).toHaveBeenCalled());
    const renderedText = mockCanvas.context.fillText.mock.calls.map(([text]) => String(text));

    expect(mockPdfExport.autoTable).not.toHaveBeenCalled();
    expect(mockPdfExport.doc.text).not.toHaveBeenCalled();
    expect(renderedText).toEqual(
      expect.arrayContaining([
        'VLeague - Vua phá lưới',
        'Cầu thủ',
        'Đội',
        'Bàn thắng',
        'Nguyễn Tiến Linh',
        'Bình Dương',
      ]),
    );
  });

  it('uses landscape layout and keeps team-stat text inside the page', async () => {
    renderPage();

    const button = screen.getByRole('button', { name: /reports.exportTeamStatsPdf/ });
    await waitFor(() => expect(button).not.toBeDisabled());
    fireEvent.click(button);

    await waitFor(() => expect(mockPdfExport.doc.addImage).toHaveBeenCalled());

    expect(mockPdfExport.jsPDF).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'a4', orientation: 'landscape', unit: 'pt' }),
    );

    const titleCall = mockCanvas.context.fillText.mock.calls.find(
      ([text]) => text === 'VLeague - Thống kê đội bóng',
    );
    expect(titleCall?.[3]).toBeLessThanOrEqual(762);

    const teamNameCall = mockCanvas.context.fillText.mock.calls.find(
      ([text]) => text === 'Hà Nội FC',
    );
    expect(teamNameCall?.[1]).toBeLessThanOrEqual(48);

    const firstColumnWidth = mockCanvas.context.strokeRect.mock.calls[0]?.[2];
    expect(firstColumnWidth).toBeGreaterThanOrEqual(180);
  });
});
