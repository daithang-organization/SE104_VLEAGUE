-- AlterTable
ALTER TABLE "team_invitations" ADD COLUMN     "promotion_note" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "team_manager_assignments" ALTER COLUMN "id" DROP DEFAULT;
