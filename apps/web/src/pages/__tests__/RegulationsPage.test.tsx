import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockRegulationApi = vi.hoisted(() => ({
  apiGetRegulations: vi.fn().mockResolvedValue([
    { id: 'r1', key: 'MIN_AGE', value: '16', valueType: 'number', seasonId: 's1' },
    { id: 'r2', key: 'MAX_AGE', value: '40', valueType: 'number', seasonId: 's1' },
    { id: 'r3', key: 'MAX_ROSTER', value: '22', valueType: 'number', seasonId: 's1' },
  ]),
  apiUpsertRegulation: vi.fn().mockResolvedValue({}),
  apiDeleteRegulation: vi.fn().mockResolvedValue({}),
  apiSeedDefaultRegulations: vi.fn().mockResolvedValue([]),
}));

const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi
    .fn()
    .mockResolvedValue([{ id: 's1', name: 'V.League 2025', year: 2025, status: 'IN_PROGRESS' }]),
}));

vi.mock('../../services/regulationApi', () => mockRegulationApi);
vi.mock('../../services/seasonApi', () => mockSeasonApi);

import RegulationsPage from '../RegulationsPage';

function renderPage() {
  return render(<RegulationsPage />);
}

describe('RegulationsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('Quy định giải đấu')).toBeInTheDocument();
  });

  it('calls apiGetSeasons on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
    });
  });

  it('loads regulations when season is selected', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockRegulationApi.apiGetRegulations).toHaveBeenCalledWith('s1');
    });
  });

  it('renders regulation keys', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('MIN_AGE')).toBeInTheDocument();
      expect(screen.getByText('MAX_AGE')).toBeInTheDocument();
      expect(screen.getByText('MAX_ROSTER')).toBeInTheDocument();
    });
  });

  it('renders regulation values', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('22')).toBeInTheDocument();
    });
  });

  it('renders action buttons', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Khởi tạo mặc định')).toBeInTheDocument();
      expect(screen.getByText('Thêm quy định')).toBeInTheDocument();
    });
  });
});
