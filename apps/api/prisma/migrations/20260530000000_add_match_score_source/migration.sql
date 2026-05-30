CREATE TYPE "MatchScoreSource" AS ENUM ('ADMIN', 'REFEREE');

ALTER TABLE "matches"
ADD COLUMN "score_source" "MatchScoreSource";

UPDATE "matches"
SET "score_source" = 'ADMIN'
WHERE "home_score" IS NOT NULL
  AND "away_score" IS NOT NULL;
