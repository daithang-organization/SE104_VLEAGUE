ALTER TABLE "players" ADD COLUMN "career_summary" TEXT;

ALTER TABLE "season_teams" ADD COLUMN "fee_receipt_url" TEXT;

ALTER TABLE "match_events" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'MANUAL';

CREATE INDEX "match_events_match_id_source_idx" ON "match_events"("match_id", "source");
