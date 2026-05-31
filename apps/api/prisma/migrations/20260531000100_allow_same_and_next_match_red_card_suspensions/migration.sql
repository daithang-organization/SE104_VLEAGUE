DROP INDEX IF EXISTS "player_suspensions_player_id_source_match_id_reason_key";

CREATE UNIQUE INDEX "player_suspensions_player_id_source_match_id_effective_match_id_reason_key"
ON "player_suspensions"("player_id", "source_match_id", "effective_match_id", "reason");
