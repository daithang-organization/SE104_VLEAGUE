-- Safe TEXT → UUID conversion (preserves existing data)
-- All existing TEXT values are already valid UUIDs from Prisma @default(uuid())

-- ============================================================
-- Step 1: Drop all FK constraints (order doesn't matter)
-- ============================================================

ALTER TABLE "match_events" DROP CONSTRAINT IF EXISTS "match_events_match_id_fkey";
ALTER TABLE "match_events" DROP CONSTRAINT IF EXISTS "match_events_player_id_fkey";
ALTER TABLE "match_events" DROP CONSTRAINT IF EXISTS "match_events_related_player_id_fkey";
ALTER TABLE "match_events" DROP CONSTRAINT IF EXISTS "match_events_team_id_fkey";
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_away_team_id_fkey";
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_home_team_id_fkey";
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_season_id_fkey";
ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_stadium_id_fkey";
ALTER TABLE "otp_codes" DROP CONSTRAINT IF EXISTS "otp_codes_user_id_fkey";
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_user_id_fkey";
ALTER TABLE "regulations" DROP CONSTRAINT IF EXISTS "regulations_season_id_fkey";
ALTER TABLE "season_teams" DROP CONSTRAINT IF EXISTS "season_teams_season_id_fkey";
ALTER TABLE "season_teams" DROP CONSTRAINT IF EXISTS "season_teams_team_id_fkey";
ALTER TABLE "standings" DROP CONSTRAINT IF EXISTS "standings_season_id_fkey";
ALTER TABLE "standings" DROP CONSTRAINT IF EXISTS "standings_team_id_fkey";
ALTER TABLE "team_players" DROP CONSTRAINT IF EXISTS "team_players_player_id_fkey";
ALTER TABLE "team_players" DROP CONSTRAINT IF EXISTS "team_players_team_id_fkey";
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_stadium_id_fkey";

-- ============================================================
-- Step 2: Drop indexes that reference columns being altered
-- ============================================================

DROP INDEX IF EXISTS "match_events_match_id_idx";
DROP INDEX IF EXISTS "match_events_player_id_idx";
DROP INDEX IF EXISTS "match_events_team_id_idx";
DROP INDEX IF EXISTS "matches_home_team_id_idx";
DROP INDEX IF EXISTS "matches_away_team_id_idx";
DROP INDEX IF EXISTS "matches_season_id_idx";
DROP INDEX IF EXISTS "matches_season_id_round_no_idx";
DROP INDEX IF EXISTS "otp_codes_user_id_idx";
DROP INDEX IF EXISTS "refresh_tokens_user_id_idx";
DROP INDEX IF EXISTS "regulations_season_id_idx";
DROP INDEX IF EXISTS "regulations_season_id_key_key";
DROP INDEX IF EXISTS "season_teams_season_id_idx";
DROP INDEX IF EXISTS "season_teams_team_id_idx";
DROP INDEX IF EXISTS "season_teams_season_id_team_id_key";
DROP INDEX IF EXISTS "standings_season_id_idx";
DROP INDEX IF EXISTS "standings_season_id_team_id_key";
DROP INDEX IF EXISTS "team_players_team_id_idx";
DROP INDEX IF EXISTS "team_players_player_id_idx";
DROP INDEX IF EXISTS "team_players_team_id_player_id_joined_at_key";

-- ============================================================
-- Step 3: Convert PK columns TEXT → UUID (parent tables first)
-- ============================================================

-- roles
ALTER TABLE "roles" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- users
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- stadiums
ALTER TABLE "stadiums" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- seasons
ALTER TABLE "seasons" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- players
ALTER TABLE "players" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;

-- teams (PK + FK)
ALTER TABLE "teams" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "teams" ALTER COLUMN "stadium_id" SET DATA TYPE UUID USING "stadium_id"::uuid;

-- ============================================================
-- Step 4: Convert FK columns TEXT → UUID (child tables)
-- ============================================================

-- refresh_tokens
ALTER TABLE "refresh_tokens" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "refresh_tokens" ALTER COLUMN "user_id" SET DATA TYPE UUID USING "user_id"::uuid;

-- otp_codes
ALTER TABLE "otp_codes" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "otp_codes" ALTER COLUMN "user_id" SET DATA TYPE UUID USING "user_id"::uuid;

-- team_players
ALTER TABLE "team_players" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "team_players" ALTER COLUMN "team_id" SET DATA TYPE UUID USING "team_id"::uuid;
ALTER TABLE "team_players" ALTER COLUMN "player_id" SET DATA TYPE UUID USING "player_id"::uuid;

-- season_teams
ALTER TABLE "season_teams" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "season_teams" ALTER COLUMN "season_id" SET DATA TYPE UUID USING "season_id"::uuid;
ALTER TABLE "season_teams" ALTER COLUMN "team_id" SET DATA TYPE UUID USING "team_id"::uuid;

-- matches
ALTER TABLE "matches" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "matches" ALTER COLUMN "season_id" SET DATA TYPE UUID USING "season_id"::uuid;
ALTER TABLE "matches" ALTER COLUMN "home_team_id" SET DATA TYPE UUID USING "home_team_id"::uuid;
ALTER TABLE "matches" ALTER COLUMN "away_team_id" SET DATA TYPE UUID USING "away_team_id"::uuid;
ALTER TABLE "matches" ALTER COLUMN "stadium_id" SET DATA TYPE UUID USING "stadium_id"::uuid;

-- match_events
ALTER TABLE "match_events" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "match_events" ALTER COLUMN "match_id" SET DATA TYPE UUID USING "match_id"::uuid;
ALTER TABLE "match_events" ALTER COLUMN "player_id" SET DATA TYPE UUID USING "player_id"::uuid;
ALTER TABLE "match_events" ALTER COLUMN "related_player_id" SET DATA TYPE UUID USING "related_player_id"::uuid;
ALTER TABLE "match_events" ALTER COLUMN "team_id" SET DATA TYPE UUID USING "team_id"::uuid;

-- regulations
ALTER TABLE "regulations" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "regulations" ALTER COLUMN "season_id" SET DATA TYPE UUID USING "season_id"::uuid;

-- standings
ALTER TABLE "standings" ALTER COLUMN "id" SET DATA TYPE UUID USING "id"::uuid;
ALTER TABLE "standings" ALTER COLUMN "season_id" SET DATA TYPE UUID USING "season_id"::uuid;
ALTER TABLE "standings" ALTER COLUMN "team_id" SET DATA TYPE UUID USING "team_id"::uuid;

-- ============================================================
-- Step 5: Recreate indexes
-- ============================================================

CREATE INDEX "match_events_match_id_idx" ON "match_events"("match_id");
CREATE INDEX "match_events_player_id_idx" ON "match_events"("player_id");
CREATE INDEX "match_events_team_id_idx" ON "match_events"("team_id");
CREATE INDEX "matches_home_team_id_idx" ON "matches"("home_team_id");
CREATE INDEX "matches_away_team_id_idx" ON "matches"("away_team_id");
CREATE INDEX "matches_season_id_idx" ON "matches"("season_id");
CREATE INDEX "matches_season_id_round_no_idx" ON "matches"("season_id", "round_no");
CREATE INDEX "otp_codes_user_id_idx" ON "otp_codes"("user_id");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "regulations_season_id_idx" ON "regulations"("season_id");
CREATE UNIQUE INDEX "regulations_season_id_key_key" ON "regulations"("season_id", "key");
CREATE INDEX "season_teams_season_id_idx" ON "season_teams"("season_id");
CREATE INDEX "season_teams_team_id_idx" ON "season_teams"("team_id");
CREATE UNIQUE INDEX "season_teams_season_id_team_id_key" ON "season_teams"("season_id", "team_id");
CREATE INDEX "standings_season_id_idx" ON "standings"("season_id");
CREATE UNIQUE INDEX "standings_season_id_team_id_key" ON "standings"("season_id", "team_id");
CREATE INDEX "team_players_team_id_idx" ON "team_players"("team_id");
CREATE INDEX "team_players_player_id_idx" ON "team_players"("player_id");
CREATE UNIQUE INDEX "team_players_team_id_player_id_joined_at_key" ON "team_players"("team_id", "player_id", "joined_at");

-- ============================================================
-- Step 6: Recreate all FK constraints
-- ============================================================

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_stadium_id_fkey" FOREIGN KEY ("stadium_id") REFERENCES "stadiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "season_teams" ADD CONSTRAINT "season_teams_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "season_teams" ADD CONSTRAINT "season_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_stadium_id_fkey" FOREIGN KEY ("stadium_id") REFERENCES "stadiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_related_player_id_fkey" FOREIGN KEY ("related_player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "regulations" ADD CONSTRAINT "regulations_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "standings" ADD CONSTRAINT "standings_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
