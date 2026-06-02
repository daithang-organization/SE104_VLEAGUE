import {
  buildTieScenarioSeason,
  summarizeHeadToHeadAggregate,
} from './standings-tie-scenarios.seed';

describe('standings tie scenario seed generation', () => {
  const seasonId = 'season-tie-test';
  const startDate = new Date('2022-09-03T00:00:00.000Z');
  const teamIds = Array.from({ length: 10 }, (_, index) => `team-${index + 1}`);

  it('creates a full season where two teams have equal points but different goal difference', () => {
    const season = buildTieScenarioSeason({
      scenario: 'goal-diff',
      seasonId,
      teamIds,
      startDate,
    });

    expect(season.matches).toHaveLength(90);
    expect(new Set(season.matches.map((match) => match.roundNo)).size).toBe(18);
    for (let roundNo = 1; roundNo <= 18; roundNo++) {
      expect(
        season.matches.filter((match) => match.roundNo === roundNo),
      ).toHaveLength(5);
    }

    const alpha = season.standings.find(
      (standing) => standing.teamId === teamIds[0],
    );
    const bravo = season.standings.find(
      (standing) => standing.teamId === teamIds[1],
    );

    expect(alpha?.points).toBe(bravo?.points);
    expect(alpha?.goalDiff).toBeGreaterThan(bravo?.goalDiff ?? 0);
    expect(alpha?.rank).toBe(1);
    expect(bravo?.rank).toBe(2);
    expect(
      season.standings
        .filter((standing) => !teamIds.slice(0, 2).includes(standing.teamId))
        .every((standing) => standing.points < (alpha?.points ?? 0)),
    ).toBe(true);
  });

  it('creates a full season where two teams need draw lot after equal points, goal difference, and head-to-head aggregate', () => {
    const season = buildTieScenarioSeason({
      scenario: 'draw-lot',
      seasonId,
      teamIds,
      startDate,
    });

    expect(season.matches).toHaveLength(90);

    const alpha = season.standings.find(
      (standing) => standing.teamId === teamIds[0],
    );
    const bravo = season.standings.find(
      (standing) => standing.teamId === teamIds[1],
    );
    const headToHead = summarizeHeadToHeadAggregate(
      season.matches,
      teamIds[0],
      teamIds[1],
    );

    expect(alpha?.points).toBe(bravo?.points);
    expect(alpha?.goalDiff).toBe(bravo?.goalDiff);
    expect(alpha?.rank).toBe(1);
    expect(bravo?.rank).toBe(1);
    expect(headToHead).toEqual({ firstGoals: 1, secondGoals: 1 });
    expect(
      season.standings
        .filter((standing) => !teamIds.slice(0, 2).includes(standing.teamId))
        .every((standing) => standing.points < (alpha?.points ?? 0)),
    ).toBe(true);
  });
});
