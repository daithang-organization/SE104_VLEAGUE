import { MatchScoreSource, MatchStatus } from '@prisma/client';

export type TieScenarioSlug = 'goal-diff' | 'draw-lot';

export type TieScenarioDefinition = {
  seasonName: string;
  year: number;
  startDate: Date;
  endDate: Date;
  description: string;
};

export type TieScenarioMatchSeed = {
  seasonId: string;
  roundNo: number;
  leg: number;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: Date;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  scoreSource: MatchScoreSource;
};

export type TieScenarioStandingSeed = {
  seasonId: string;
  teamId: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  rank: number;
};

type Fixture = {
  roundNo: number;
  leg: number;
  homeTeamId: string;
  awayTeamId: string;
};

type Score = {
  homeScore: number;
  awayScore: number;
};

type StandingAccumulator = Omit<TieScenarioStandingSeed, 'goalDiff' | 'rank'>;

export const TIE_SCENARIO_SLUGS: TieScenarioSlug[] = ['goal-diff', 'draw-lot'];

export const TIE_SCENARIO_DEFINITIONS: Record<
  TieScenarioSlug,
  TieScenarioDefinition
> = {
  'goal-diff': {
    seasonName: 'V.League 2022-2023 - Equal Points Different GD',
    year: 2022,
    startDate: new Date('2022-09-03T00:00:00.000Z'),
    endDate: new Date('2023-05-27T00:00:00.000Z'),
    description:
      'Top two teams finish level on points, but the first seeded real team has higher goal difference.',
  },
  'draw-lot': {
    seasonName: 'V.League 2023-2024 - Draw Lot Required',
    year: 2023,
    startDate: new Date('2023-09-02T00:00:00.000Z'),
    endDate: new Date('2024-05-25T00:00:00.000Z'),
    description:
      'Top two teams finish level on points, goal difference, and head-to-head aggregate.',
  },
};

export const TIE_SCENARIO_TEAM_NAMES = [
  'Thép Xanh Nam Định',
  'Hà Nội FC',
  'Công An Hà Nội',
  'Thể Công-Viettel',
  'Becamex Bình Dương',
  'Hải Phòng FC',
  'Đông Á Thanh Hóa',
  'LPBank Hoàng Anh Gia Lai',
  'TP.HCM FC',
  'Sông Lam Nghệ An',
] as const;

export function buildTieScenarioSeason({
  scenario,
  seasonId,
  teamIds,
  startDate,
}: {
  scenario: TieScenarioSlug;
  seasonId: string;
  teamIds: string[];
  startDate: Date;
}) {
  if (teamIds.length !== 10) {
    throw new Error('Tie scenario seed requires exactly 10 teams.');
  }

  const teamIndexById = new Map(
    teamIds.map((teamId, index) => [teamId, index]),
  );
  const stats = new Map(
    teamIds.map((teamId) => [teamId, emptyStanding(seasonId, teamId)]),
  );

  const matches = buildDoubleRoundRobinFixtures(teamIds).map((fixture) => {
    const score = getTieScenarioScore(
      scenario,
      teamIndexById.get(fixture.homeTeamId)!,
      teamIndexById.get(fixture.awayTeamId)!,
    );

    recordMatch(
      stats,
      fixture.homeTeamId,
      fixture.awayTeamId,
      score.homeScore,
      score.awayScore,
    );

    return {
      ...fixture,
      seasonId,
      kickoffAt: getKickoffAt(startDate, fixture.roundNo),
      ...score,
      status: MatchStatus.FINISHED,
      scoreSource: MatchScoreSource.ADMIN,
    };
  });

  return {
    matches,
    standings: rankStandings([...stats.values()]),
  };
}

export function summarizeHeadToHeadAggregate(
  matches: Pick<
    TieScenarioMatchSeed,
    'homeTeamId' | 'awayTeamId' | 'homeScore' | 'awayScore'
  >[],
  firstTeamId: string,
  secondTeamId: string,
) {
  let firstGoals = 0;
  let secondGoals = 0;

  for (const match of matches) {
    const isHeadToHead =
      (match.homeTeamId === firstTeamId && match.awayTeamId === secondTeamId) ||
      (match.homeTeamId === secondTeamId && match.awayTeamId === firstTeamId);

    if (!isHeadToHead) continue;

    if (match.homeTeamId === firstTeamId) {
      firstGoals += match.homeScore;
      secondGoals += match.awayScore;
    } else {
      firstGoals += match.awayScore;
      secondGoals += match.homeScore;
    }
  }

  return { firstGoals, secondGoals };
}

function buildDoubleRoundRobinFixtures(teamIds: string[]) {
  const firstLegFixtures: Fixture[] = [];
  const circle = [...teamIds];
  const fixed = circle.shift()!;
  const rounds = teamIds.length - 1;
  const matchesPerRound = teamIds.length / 2;

  for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
    firstLegFixtures.push({
      roundNo: roundIndex + 1,
      leg: 1,
      homeTeamId: roundIndex % 2 === 0 ? fixed : circle[0],
      awayTeamId: roundIndex % 2 === 0 ? circle[0] : fixed,
    });

    for (let index = 1; index < matchesPerRound; index++) {
      const left = circle[index];
      const right = circle[teamIds.length - 1 - index];
      firstLegFixtures.push({
        roundNo: roundIndex + 1,
        leg: 1,
        homeTeamId: roundIndex % 2 === 0 ? left : right,
        awayTeamId: roundIndex % 2 === 0 ? right : left,
      });
    }

    circle.push(circle.shift()!);
  }

  return [
    ...firstLegFixtures,
    ...firstLegFixtures.map((fixture) => ({
      roundNo: fixture.roundNo + rounds,
      leg: 2,
      homeTeamId: fixture.awayTeamId,
      awayTeamId: fixture.homeTeamId,
    })),
  ];
}

function getTieScenarioScore(
  scenario: TieScenarioSlug,
  homeIndex: number,
  awayIndex: number,
): Score {
  const alphaIndex = 0;
  const bravoIndex = 1;
  const alphaBravoMatch =
    (homeIndex === alphaIndex && awayIndex === bravoIndex) ||
    (homeIndex === bravoIndex && awayIndex === alphaIndex);

  if (scenario === 'goal-diff') {
    if (alphaBravoMatch) return { homeScore: 1, awayScore: 1 };
    if (homeIndex === alphaIndex || awayIndex === alphaIndex) {
      return scoreWinner(homeIndex, alphaIndex, 3);
    }
    if (homeIndex === bravoIndex || awayIndex === bravoIndex) {
      return scoreWinner(homeIndex, bravoIndex, 1);
    }
  }

  if (scenario === 'draw-lot') {
    if (alphaBravoMatch) return { homeScore: 1, awayScore: 0 };
    if (homeIndex === alphaIndex || awayIndex === alphaIndex) {
      return scoreWinner(homeIndex, alphaIndex, 2);
    }
    if (homeIndex === bravoIndex || awayIndex === bravoIndex) {
      return scoreWinner(homeIndex, bravoIndex, 2);
    }
  }

  const strongerTeamIndex = Math.min(homeIndex, awayIndex);
  return scoreWinner(homeIndex, strongerTeamIndex, 1);
}

function scoreWinner(
  homeIndex: number,
  winningTeamIndex: number,
  winningGoals: number,
): Score {
  return homeIndex === winningTeamIndex
    ? { homeScore: winningGoals, awayScore: 0 }
    : { homeScore: 0, awayScore: winningGoals };
}

function emptyStanding(seasonId: string, teamId: string): StandingAccumulator {
  return {
    seasonId,
    teamId,
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function recordMatch(
  stats: Map<string, StandingAccumulator>,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
) {
  const home = stats.get(homeTeamId)!;
  const away = stats.get(awayTeamId)!;

  home.played++;
  away.played++;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.win++;
    home.points += 3;
    away.loss++;
    return;
  }

  if (homeScore < awayScore) {
    away.win++;
    away.points += 3;
    home.loss++;
    return;
  }

  home.draw++;
  away.draw++;
  home.points++;
  away.points++;
}

function rankStandings(
  standings: StandingAccumulator[],
): TieScenarioStandingSeed[] {
  const sorted = standings
    .map((standing) => ({
      ...standing,
      goalDiff: standing.goalsFor - standing.goalsAgainst,
    }))
    .sort(
      (first, second) =>
        second.points - first.points ||
        second.goalDiff - first.goalDiff ||
        first.teamId.localeCompare(second.teamId),
    );

  let currentRank = 1;
  return sorted.map((standing, index) => {
    const previous = sorted[index - 1];
    if (
      previous &&
      (standing.points !== previous.points ||
        standing.goalDiff !== previous.goalDiff)
    ) {
      currentRank = index + 1;
    }

    return { ...standing, rank: currentRank };
  });
}

function getKickoffAt(startDate: Date, roundNo: number) {
  const kickoffAt = new Date(startDate);
  kickoffAt.setUTCDate(startDate.getUTCDate() + (roundNo - 1) * 7);
  kickoffAt.setUTCHours(11, 0, 0, 0);
  return kickoffAt;
}
