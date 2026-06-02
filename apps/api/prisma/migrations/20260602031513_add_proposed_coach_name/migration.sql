-- AlterTable
ALTER TABLE "manager_player_requests" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "manager_stadium_requests" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "team_manager_requests" ADD COLUMN     "proposed_coach_name" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "player_suspensions_player_id_source_match_id_effective_match_id" RENAME TO "player_suspensions_player_id_source_match_id_effective_matc_key";
