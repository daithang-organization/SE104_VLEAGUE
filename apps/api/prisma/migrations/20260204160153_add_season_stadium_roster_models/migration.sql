/*
  Warnings:

  - A unique constraint covering the columns `[facebook_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `season_id` to the `matches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('UPCOMING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchEventType" AS ENUM ('GOAL', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'PENALTY_SCORED', 'PENALTY_MISSED');

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "away_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "home_score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "season_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "stadium_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "facebook_id" TEXT;

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'UPCOMING',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stadiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stadiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_players" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "jersey_number" INTEGER,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "team_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "minute" INTEGER NOT NULL,
    "type" "MatchEventType" NOT NULL,
    "player_id" TEXT,
    "team_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seasons_name_key" ON "seasons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stadiums_name_key" ON "stadiums"("name");

-- CreateIndex
CREATE INDEX "team_players_team_id_idx" ON "team_players"("team_id");

-- CreateIndex
CREATE INDEX "team_players_player_id_idx" ON "team_players"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_players_team_id_player_id_key" ON "team_players"("team_id", "player_id");

-- CreateIndex
CREATE INDEX "match_events_match_id_idx" ON "match_events"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_id_key" ON "users"("facebook_id");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_stadium_id_fkey" FOREIGN KEY ("stadium_id") REFERENCES "stadiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_stadium_id_fkey" FOREIGN KEY ("stadium_id") REFERENCES "stadiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
