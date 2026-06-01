import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
  apiGetCardStats: vi.fn().mockResolvedValue([
    {
      playerId: 'p5',
      playerName: 'Yellow Card Player',
      teamName: 'Hà Nội FC',
      position: 1,
      yellowCards: 4,
      redCards: 0,
      totalCards: 4,
    },
    {
      playerId: 'p6',
      playerName: 'Red Card Player',
      teamName: 'Hải Phòng FC',
      position: 2,
      yellowCards: 1,
      redCards: 2,
      totalCards: 3,
    },
  ]),
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
  apiGetPlayerOfMatchStats: vi.fn().mockResolvedValue([
    {
      playerId: 'p3',
      playerName: 'Cầu thủ xuất sắc',
      position: 1,
      awards: 3,
    },
  ]),
  apiGetSuspensionStats: vi.fn().mockResolvedValue([
    {
      id: 'sus1',
      playerId: 'p4',
      playerName: 'Cầu thủ bị treo giò',
      teamName: 'HAGL',
      reason: '2 thẻ vàng',
      status: 'ACTIVE',
      sourceRound: 3,
      effectiveRound: 4,
    },
  ]),
  apiGetSeasonAwards: vi.fn().mockResolvedValue({
    champion: { teamName: 'Hà Nội FC', points: 25 },
    runnerUp: { teamName: 'Bình Dương', points: 22 },
    topScorer: { playerName: 'Nguyễn Tiến Linh', teamName: 'Bình Dương', goals: 12 },
    bestPlayer: { playerName: 'Cầu thủ xuất sắc', awards: 3 },
    requiresDrawLot: false,
    standings: [],
  }),
}));
const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi.fn().mockResolvedValue([
    {
      id: 's2025',
      name: 'V.League 2025',
      year: 2025,
      status: 'COMPLETED',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 's2026',
      name: 'V.League 2026',
      year: 2026,
      status: 'IN_PROGRESS',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]),
  apiGetCurrentSeason: vi.fn().mockResolvedValue({
    id: 's2025',
    name: 'V.League 2025',
    year: 2025,
    status: 'COMPLETED',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  }),
}));

vi.mock('jspdf', () => ({ default: mockPdfExport.jsPDF }));
vi.mock('jspdf-autotable', () => ({ default: mockPdfExport.autoTable }));
vi.mock('../../services/standingsApi', () => mockStandingsApi);
vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../../components', () => ({
  AppMenuIcon: ({ menuKey }: { menuKey: string }) => (
    <span data-testid={`app-menu-icon-${menuKey}`} />
  ),
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

function renderPage(initialEntry = '/reports') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
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
    expect(container.querySelector('.page-cover')).toBeInTheDocument();
  });

  it('shows leaders in the hero metrics', async () => {
    const { container } = renderPage();

    await waitFor(() => {
      const metricValues = Array.from(container.querySelectorAll('.page-hero-metric strong')).map(
        (node) => node.textContent,
      );
      expect(metricValues).toEqual([
        '12Nguyễn Tiến Linh',
        '6Player Assist',
        '4Yellow Card Player',
        '2Red Card Player',
      ]);
    });
  });

  it('fetches all data on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetTopScorers).toHaveBeenCalledWith('s2026', 50);
      expect(mockStandingsApi.apiGetTopAssists).toHaveBeenCalledWith('s2026', 50);
      expect(mockStandingsApi.apiGetCardStats).toHaveBeenCalledWith('s2026', 30);
      expect(mockStandingsApi.apiGetTeamStats).toHaveBeenCalledWith('s2026');
      expect(mockStandingsApi.apiGetPlayerOfMatchStats).toHaveBeenCalledWith('s2026', 30);
      expect(mockStandingsApi.apiGetSuspensionStats).toHaveBeenCalledWith('s2026');
      expect(mockStandingsApi.apiGetSeasonAwards).toHaveBeenCalledWith('s2026');
    });
  });

  it('shows the default latest season in the report header', async () => {
    renderPage();

    expect((await screen.findAllByText('V.League 2026')).length).toBeGreaterThan(0);
  });

  it('keeps a previously selected season when navigating back to reports', async () => {
    sessionStorage.setItem('vleague-selected-season-id', 's2025');

    renderPage();

    await waitFor(() => {
      expect(mockStandingsApi.apiGetTopScorers).toHaveBeenCalledWith('s2025', 50);
    });
    expect((await screen.findAllByText('V.League 2025')).length).toBeGreaterThan(0);
  });

  it('renders tab labels', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('reports.tabScorers').length).toBeGreaterThan(0);
      expect(screen.getAllByText('reports.metricYellowCards').length).toBeGreaterThan(0);
      expect(screen.getAllByText('reports.metricRedCards').length).toBeGreaterThan(0);
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
