import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MatchFixtureCard from '../MatchFixtureCard';

describe('MatchFixtureCard', () => {
  it('renders a themed score card with shared fixture classes and actions', () => {
    const onTeamClick = vi.fn();
    const onMatchClick = vi.fn();

    const { container } = render(
      <MatchFixtureCard
        id="m1"
        roundLabel="Vong 1"
        statusLabel="Ket thuc"
        statusColor="green"
        homeTeamId="t1"
        awayTeamId="t2"
        homeTeam={{ id: 't1', name: 'Ha Noi FC', shortName: 'HN' }}
        awayTeam={{ id: 't2', name: 'Hai Phong FC', shortName: 'HP' }}
        homeScore={2}
        awayScore={1}
        kickoffAt="2025-03-15T17:00:00Z"
        stadiumName="Hang Day"
        stadiumFallback="Chua co san"
        kickoffFallback="Chua xep gio"
        actions={<button type="button">Chi tiet</button>}
        onTeamClick={onTeamClick}
        onMatchClick={onMatchClick}
      />,
    );

    const card = container.querySelector('.match-fixture-card.schedule-fixture-row');
    expect(card).toBeInTheDocument();
    expect((card as HTMLElement).style.getPropertyValue('--match-home-accent')).toBe('#f7c948');
    expect((card as HTMLElement).style.getPropertyValue('--match-away-accent')).toBe('#d71920');

    expect(screen.getByText('Vong 1')).toBeInTheDocument();
    expect(screen.getByText('Ket thuc')).toBeInTheDocument();
    expect(screen.getByText('HN')).toBeInTheDocument();
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByAltText('HN logo')).toHaveClass('schedule-match-logo');
    expect(screen.getByAltText('HP logo')).toHaveClass('schedule-match-logo');
    expect(screen.getByRole('button', { name: /2 - 1/ })).toHaveClass(
      'schedule-fixture-score',
      'is-final',
      'is-score-card',
    );
    expect(screen.getByText('Hang Day')).toBeInTheDocument();
    expect(screen.getByText('Chi tiet')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /HN/ }));
    fireEvent.click(screen.getByRole('button', { name: /2 - 1/ }));
    expect(onTeamClick).toHaveBeenCalledWith('t1');
    expect(onMatchClick).toHaveBeenCalledWith('m1');
  });

  it('uses schedule time or result placeholder when a match has no score', () => {
    const { rerender } = render(
      <MatchFixtureCard
        id="m2"
        roundLabel="Vong 2"
        statusLabel="Sap dau"
        homeTeamId="custom-home"
        awayTeamId="custom-away"
        homeTeam={{ id: 'custom-home', name: 'Custom Home', shortName: 'CH' }}
        awayTeam={{ id: 'custom-away', name: 'Custom Away', shortName: 'CA' }}
        kickoffAt="2025-03-16T13:15:00Z"
        stadiumFallback="Chua co san"
        kickoffFallback="Chua xep gio"
      />,
    );

    expect(screen.getByRole('button', { name: /20:15/ })).not.toHaveClass('is-score-card');
    expect(
      screen.getAllByText('CH').some((el) => el.classList.contains('schedule-match-logo-fallback')),
    ).toBe(true);
    expect(
      screen.getAllByText('CA').some((el) => el.classList.contains('schedule-match-logo-fallback')),
    ).toBe(true);

    rerender(
      <MatchFixtureCard
        id="m2"
        roundLabel="Vong 2"
        statusLabel="Nhap"
        homeTeamId="custom-home"
        awayTeamId="custom-away"
        homeTeam={{ id: 'custom-home', name: 'Custom Home', shortName: 'CH' }}
        awayTeam={{ id: 'custom-away', name: 'Custom Away', shortName: 'CA' }}
        scoreMode="result-placeholder"
        stadiumFallback="Chua co san"
        kickoffFallback="Chua xep gio"
      />,
    );

    expect(screen.getByRole('button', { name: /\u2014 : \u2014/ })).toBeInTheDocument();
  });
});
