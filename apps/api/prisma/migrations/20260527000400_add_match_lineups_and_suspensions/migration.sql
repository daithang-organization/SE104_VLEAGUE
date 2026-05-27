-- P3: match lineup registration and player suspensions

CREATE TYPE "MatchKitType" AS ENUM ('PRIMARY', 'BACKUP');
CREATE TYPE "MatchLineupRole" AS ENUM ('STARTER', 'SUBSTITUTE');
CREATE TYPE "MatchLineupStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "PlayerSuspensionStatus" AS ENUM ('ACTIVE', 'SERVED', 'CANCELLED');

CREATE TABLE "match_team_registrations" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "kit_type" "MatchKitType" NOT NULL DEFAULT 'PRIMARY',
    "formation" TEXT NOT NULL,
    "status" "MatchLineupStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_team_registrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "match_lineup_players" (
    "id" UUID NOT NULL,
    "registration_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "role" "MatchLineupRole" NOT NULL,
    "position" "PlayerPosition",
    "shirt_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_lineup_players_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "player_suspensions" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "source_match_id" UUID NOT NULL,
    "effective_match_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "PlayerSuspensionStatus" NOT NULL DEFAULT 'ACTIVE',
    "served_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_suspensions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "match_team_registrations_match_id_team_id_key" ON "match_team_registrations"("match_id", "team_id");
CREATE INDEX "match_team_registrations_match_id_idx" ON "match_team_registrations"("match_id");
CREATE INDEX "match_team_registrations_team_id_idx" ON "match_team_registrations"("team_id");
CREATE INDEX "match_team_registrations_status_idx" ON "match_team_registrations"("status");

CREATE UNIQUE INDEX "match_lineup_players_registration_id_player_id_key" ON "match_lineup_players"("registration_id", "player_id");
CREATE INDEX "match_lineup_players_player_id_idx" ON "match_lineup_players"("player_id");
CREATE INDEX "match_lineup_players_role_idx" ON "match_lineup_players"("role");

CREATE UNIQUE INDEX "player_suspensions_player_id_source_match_id_reason_key" ON "player_suspensions"("player_id", "source_match_id", "reason");
CREATE INDEX "player_suspensions_team_id_idx" ON "player_suspensions"("team_id");
CREATE INDEX "player_suspensions_season_id_idx" ON "player_suspensions"("season_id");
CREATE INDEX "player_suspensions_effective_match_id_idx" ON "player_suspensions"("effective_match_id");
CREATE INDEX "player_suspensions_status_idx" ON "player_suspensions"("status");

ALTER TABLE "match_team_registrations"
ADD CONSTRAINT "match_team_registrations_match_id_fkey"
FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "match_team_registrations"
ADD CONSTRAINT "match_team_registrations_team_id_fkey"
FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "match_lineup_players"
ADD CONSTRAINT "match_lineup_players_registration_id_fkey"
FOREIGN KEY ("registration_id") REFERENCES "match_team_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "match_lineup_players"
ADD CONSTRAINT "match_lineup_players_player_id_fkey"
FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "player_suspensions"
ADD CONSTRAINT "player_suspensions_player_id_fkey"
FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_suspensions"
ADD CONSTRAINT "player_suspensions_team_id_fkey"
FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_suspensions"
ADD CONSTRAINT "player_suspensions_season_id_fkey"
FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_suspensions"
ADD CONSTRAINT "player_suspensions_source_match_id_fkey"
FOREIGN KEY ("source_match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_suspensions"
ADD CONSTRAINT "player_suspensions_effective_match_id_fkey"
FOREIGN KEY ("effective_match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
