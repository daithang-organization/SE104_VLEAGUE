import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockSearchApi = vi.hoisted(() => ({
  apiGetHeadToHead: vi.fn().mockResolvedValue({
    totalMatches: 5,
    draws: 1,
    team1: { wins: 3, goals: 8 },
    team2: { wins: 1, goals: 4 },
    matches: [],
  }),
}));

vi.mock('../../services/searchApi', () => mockSearchApi);
vi.mock('../../services/seasonApi', () => ({
  apiGetSeasons: vi
    .fn()
    .mockResolvedValue([{ id: 's1', name: 'V.League 2025', year: 2025, status: 'IN_PROGRESS' }]),
}));
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import HeadToHeadPage from '../HeadToHeadPage';

function renderPage() {
  return render(<HeadToHeadPage />);
}

describe('HeadToHeadPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders title', () => {
    const { container } = renderPage();
    expect(screen.getByText('headToHead.title')).toBeInTheDocument();
    expect(screen.getByText('headToHead.subtitle')).toBeInTheDocument();
    expect(container.querySelector('.page-hero')).toBeInTheDocument();
  });

  it('renders team selectors', () => {
    const { container } = renderPage();
    // Team 1 and Team 2 selectors should exist
    expect(screen.getByText('headToHead.compareBtn')).toBeInTheDocument();
    expect(container.querySelector('.page-toolbar')).toBeInTheDocument();
  });

  it('shows empty hint when no result', () => {
    renderPage();
    expect(screen.getByText('headToHead.emptyHint')).toBeInTheDocument();
  });
});
