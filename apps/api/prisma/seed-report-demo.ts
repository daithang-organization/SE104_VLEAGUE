import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_SEASON_NAME = 'V.League 2024-2025';

async function main() {
  console.log(`Seeding report demo data for ${DEFAULT_SEASON_NAME}...`);

  const season = await prisma.season.findUnique({
    where: { name: DEFAULT_SEASON_NAME },
    select: { id: true },
  });

  if (!season) {
    console.warn(
      `Season "${DEFAULT_SEASON_NAME}" not found. Skipping report demo seed.`,
    );
    return;
  }

  await prisma.$executeRaw`
    WITH goal_candidates AS (
      SELECT e.id AS event_id, tp.player_id AS assist_player_id
      FROM match_events e
      JOIN matches m ON m.id = e.match_id
      JOIN LATERAL (
        SELECT tp.player_id
        FROM team_players tp
        WHERE tp.team_id = e.team_id
          AND tp.left_at IS NULL
          AND tp.player_id <> e.player_id
        ORDER BY tp.joined_at, tp.player_id
        LIMIT 1
      ) tp ON TRUE
      WHERE m.season_id = ${season.id}::uuid
        AND e.type IN ('GOAL', 'PENALTY')
        AND e.related_player_id IS NULL
      ORDER BY e.minute, e.id
      LIMIT 12
    )
    UPDATE match_events e
    SET related_player_id = gc.assist_player_id, updated_at = NOW()
    FROM goal_candidates gc
    WHERE e.id = gc.event_id
  `;

  await prisma.$executeRaw`
    WITH target_matches AS (
      SELECT m.id, m.round_no, m.home_team_id, m.away_team_id
      FROM matches m
      WHERE m.season_id = ${season.id}::uuid
        AND m.status IN ('FINISHED','LOCKED','PUBLISHED')
      ORDER BY m.round_no, m.kickoff_at NULLS LAST, m.id
      LIMIT 8
    ), card_rows AS (
      SELECT tm.id AS match_id, tm.home_team_id AS team_id, hp.player_id, 'YELLOW_CARD' AS type, 34 AS minute, 'report-demo-yellow-home-' || tm.id AS note
      FROM target_matches tm
      JOIN LATERAL (
        SELECT player_id FROM team_players
        WHERE team_id = tm.home_team_id AND left_at IS NULL
        ORDER BY joined_at, player_id
        LIMIT 1
      ) hp ON TRUE
      UNION ALL
      SELECT tm.id, tm.away_team_id, ap.player_id, 'YELLOW_CARD' AS type, 58, 'report-demo-yellow-away-' || tm.id
      FROM target_matches tm
      JOIN LATERAL (
        SELECT player_id FROM team_players
        WHERE team_id = tm.away_team_id AND left_at IS NULL
        ORDER BY joined_at, player_id
        LIMIT 1
      ) ap ON TRUE
      WHERE tm.round_no <= 2
      UNION ALL
      SELECT tm.id, tm.away_team_id, rp.player_id, 'RED_CARD' AS type, 76, 'report-demo-red-away-' || tm.id
      FROM target_matches tm
      JOIN LATERAL (
        SELECT player_id FROM team_players
        WHERE team_id = tm.away_team_id AND left_at IS NULL
        ORDER BY joined_at DESC, player_id
        LIMIT 1
      ) rp ON TRUE
      WHERE tm.round_no = 1
      LIMIT 20
    )
    INSERT INTO match_events (id, match_id, minute, type, player_id, team_id, note, created_at, updated_at)
    SELECT gen_random_uuid(), match_id, minute, type::"EventType", player_id, team_id, note, NOW(), NOW()
    FROM card_rows cr
    WHERE NOT EXISTS (SELECT 1 FROM match_events e WHERE e.note = cr.note)
  `;

  await prisma.$executeRaw`
    WITH source AS (
      SELECT DISTINCT ON (m.id)
        m.id AS match_id,
        COALESCE(m.home_score, 0) AS home_score,
        COALESCE(m.away_score, 0) AS away_score,
        e.player_id AS best_player_id
      FROM matches m
      JOIN match_events e ON e.match_id = m.id
        AND e.type IN ('GOAL','PENALTY')
        AND e.player_id IS NOT NULL
      WHERE m.season_id = ${season.id}::uuid
        AND m.status IN ('FINISHED','LOCKED','PUBLISHED')
      ORDER BY m.id, e.minute
      LIMIT 8
    )
    INSERT INTO match_reports (
      id, match_id, home_score, away_score, best_player_id,
      technical_stats, note, submitted_at, created_at, updated_at
    )
    SELECT
      gen_random_uuid(), match_id, home_score, away_score, best_player_id,
      '{}'::jsonb, 'report-demo-player-of-match', NOW(), NOW(), NOW()
    FROM source
    ON CONFLICT (match_id) DO UPDATE
    SET best_player_id = COALESCE(match_reports.best_player_id, EXCLUDED.best_player_id),
        updated_at = NOW()
  `;

  await prisma.$executeRaw`
    WITH red_cards AS (
      SELECT e.player_id, e.team_id, e.match_id AS source_match_id, m.round_no, m.season_id
      FROM match_events e
      JOIN matches m ON m.id = e.match_id
      WHERE m.season_id = ${season.id}::uuid
        AND e.type = 'RED_CARD'
        AND e.player_id IS NOT NULL
        AND e.team_id IS NOT NULL
    ), suspensions AS (
      SELECT rc.player_id, rc.team_id, rc.season_id, rc.source_match_id,
             COALESCE(next_match.id, rc.source_match_id) AS effective_match_id,
             'RED_CARD' AS reason
      FROM red_cards rc
      LEFT JOIN LATERAL (
        SELECT m2.id
        FROM matches m2
        WHERE m2.season_id = rc.season_id
          AND m2.round_no > rc.round_no
          AND (m2.home_team_id = rc.team_id OR m2.away_team_id = rc.team_id)
        ORDER BY m2.round_no, m2.kickoff_at NULLS LAST, m2.id
        LIMIT 1
      ) next_match ON TRUE
    )
    INSERT INTO player_suspensions (
      id, player_id, team_id, season_id, source_match_id,
      effective_match_id, reason, status, created_at, updated_at
    )
    SELECT
      gen_random_uuid(), player_id, team_id, season_id, source_match_id,
      effective_match_id, reason, 'ACTIVE', NOW(), NOW()
    FROM suspensions s
    WHERE NOT EXISTS (
      SELECT 1 FROM player_suspensions ps
      WHERE ps.player_id = s.player_id
        AND ps.source_match_id = s.source_match_id
        AND ps.reason = s.reason
    )
  `;

  console.log('Report demo data seeded.');
}

main()
  .catch((error) => {
    console.error('Report demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
