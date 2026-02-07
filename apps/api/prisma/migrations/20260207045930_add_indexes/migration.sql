/*
  Warnings:

  - You are about to drop the column `away_score` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `home_score` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `season_id` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `stadium_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the `match_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seasons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stadiums` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_players` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_match_id_fkey";

-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_player_id_fkey";

-- DropForeignKey
ALTER TABLE "match_events" DROP CONSTRAINT "match_events_team_id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_away_team_id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_home_team_id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_season_id_fkey";

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_stadium_id_fkey";

-- DropForeignKey
ALTER TABLE "team_players" DROP CONSTRAINT "team_players_player_id_fkey";

-- DropForeignKey
ALTER TABLE "team_players" DROP CONSTRAINT "team_players_team_id_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_stadium_id_fkey";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "away_score",
DROP COLUMN "home_score",
DROP COLUMN "season_id";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "stadium_id";

-- DropTable
DROP TABLE "match_events";

-- DropTable
DROP TABLE "seasons";

-- DropTable
DROP TABLE "stadiums";

-- DropTable
DROP TABLE "team_players";

-- DropEnum
DROP TYPE "MatchEventType";

-- DropEnum
DROP TYPE "SeasonStatus";

-- CreateIndex
CREATE INDEX "matches_round_no_idx" ON "matches"("round_no");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_kickoff_at_idx" ON "matches"("kickoff_at");

-- CreateIndex
CREATE INDEX "matches_home_team_id_idx" ON "matches"("home_team_id");

-- CreateIndex
CREATE INDEX "matches_away_team_id_idx" ON "matches"("away_team_id");

-- CreateIndex
CREATE INDEX "players_full_name_idx" ON "players"("full_name");

-- CreateIndex
CREATE INDEX "players_nationality_idx" ON "players"("nationality");

-- CreateIndex
CREATE INDEX "players_position_idx" ON "players"("position");
