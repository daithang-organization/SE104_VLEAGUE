-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'LOCKED');

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "round_no" INTEGER NOT NULL,
    "home_team_id" TEXT NOT NULL,
    "away_team_id" TEXT NOT NULL,
    "stadium_id" TEXT,
    "kickoff_at" TIMESTAMP(3),
    "status" "MatchStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);
