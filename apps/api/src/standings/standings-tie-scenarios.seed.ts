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
    seasonName: 'Tie Test 2027 - Equal Points Different GD',
    year: 2027,
    startDate: new Date('2027-09-04T00:00:00.000Z'),
    endDate: new Date('2028-05-27T00:00:00.000Z'),
    description:
      'Top two teams finish level on points, but Alpha has higher goal difference.',
  },
  'draw-lot': {
    seasonName: 'Tie Test 2028 - Draw Lot Required',
    year: 2028,
    startDate: new Date('2028-09-02T00:00:00.000Z'),
    endDate: new Date('2029-05-26T00:00:00.000Z'),
    description:
      'Top two teams finish level on points, goal difference, and head-to-head aggregate.',
  },
};

export const TIE_SCENARIO_TEAM_SEEDS: TieScenarioTeamSeed[] = [
  {
    name: 'Tie Test Alpha FC',
    shortName: 'TTA',
    city: 'Alpha City',
    coachName: 'Alpha Coach',
    stadium: {
      name: 'Tie Test Alpha Stadium',
      city: 'Alpha City',
      address: '1 Alpha Avenue',
      capacity: 22000,
    },
  },
  {
    name: 'Tie Test Bravo FC',
    shortName: 'TTB',
    city: 'Bravo City',
    coachName: 'Bravo Coach',
    stadium: {
      name: 'Tie Test Bravo Stadium',
      city: 'Bravo City',
      address: '2 Bravo Avenue',
      capacity: 21000,
    },
  },
  {
    name: 'Tie Test Charlie FC',
    shortName: 'TTC',
    city: 'Charlie City',
    coachName: 'Charlie Coach',
    stadium: {
      name: 'Tie Test Charlie Stadium',
      city: 'Charlie City',
      address: '3 Charlie Avenue',
      capacity: 20000,
    },
  },
  {
    name: 'Tie Test Delta FC',
    shortName: 'TTD',
    city: 'Delta City',
    coachName: 'Delta Coach',
    stadium: {
      name: 'Tie Test Delta Stadium',
      city: 'Delta City',
      address: '4 Delta Avenue',
      capacity: 19000,
    },
  },
  {
    name: 'Tie Test Echo FC',
    shortName: 'TTE',
    city: 'Echo City',
    coachName: 'Echo Coach',
    stadium: {
      name: 'Tie Test Echo Stadium',
      city: 'Echo City',
      address: '5 Echo Avenue',
      capacity: 18000,
    },
  },
  {
    name: 'Tie Test Foxtrot FC',
    shortName: 'TTF',
    city: 'Foxtrot City',
    coachName: 'Foxtrot Coach',
    stadium: {
      name: 'Tie Test Foxtrot Stadium',
      city: 'Foxtrot City',
      address: '6 Foxtrot Avenue',
      capacity: 17000,
    },
  },
  {
    name: 'Tie Test Golf FC',
    shortName: 'TTG',
    city: 'Golf City',
    coachName: 'Golf Coach',
    stadium: {
      name: 'Tie Test Golf Stadium',
      city: 'Golf City',
      address: '7 Golf Avenue',
      capacity: 16000,
    },
  },
  {
    name: 'Tie Test Hotel FC',
    shortName: 'TTH',
    city: 'Hotel City',
    coachName: 'Hotel Coach',
    stadium: {
      name: 'Tie Test Hotel Stadium',
      city: 'Hotel City',
      address: '8 Hotel Avenue',
      capacity: 15000,
    },
  },
  {
    name: 'Tie Test India FC',
    shortName: 'TTI',
    city: 'India City',
    coachName: 'India Coach',
    stadium: {
      name: 'Tie Test India Stadium',
      city: 'India City',
      address: '9 India Avenue',
      capacity: 14000,
    },
  },
  {
    name: 'Tie Test Juliet FC',
    shortName: 'TTJ',
    city: 'Juliet City',
    coachName: 'Juliet Coach',
    stadium: {
      name: 'Tie Test Juliet Stadium',
      city: 'Juliet City',
      address: '10 Juliet Avenue',
      capacity: 13000,
    },
  },
];

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
