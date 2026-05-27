-- CreateEnum
CREATE TYPE "TeamInvitationSourceType" AS ENUM ('PREVIOUS_TOP_8', 'PROMOTED', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "TeamInvitationStatus" AS ENUM ('SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "team_invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "season_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "source_type" "TeamInvitationSourceType" NOT NULL,
    "status" "TeamInvitationStatus" NOT NULL DEFAULT 'SENT',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline_at" TIMESTAMP(3) NOT NULL,
    "response_at" TIMESTAMP(3),
    "response_reason" TEXT,
    "regulations_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_invitations_season_id_team_id_key" ON "team_invitations"("season_id", "team_id");

-- CreateIndex
CREATE INDEX "team_invitations_season_id_idx" ON "team_invitations"("season_id");

-- CreateIndex
CREATE INDEX "team_invitations_team_id_idx" ON "team_invitations"("team_id");

-- CreateIndex
CREATE INDEX "team_invitations_status_idx" ON "team_invitations"("status");

-- CreateIndex
CREATE INDEX "team_invitations_deadline_at_idx" ON "team_invitations"("deadline_at");

-- AddForeignKey
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
