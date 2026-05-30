-- CreateEnum
CREATE TYPE "TeamManagerRequestType" AS ENUM ('CREATE_TEAM', 'CLAIM_EXISTING_TEAM');

-- CreateEnum
CREATE TYPE "TeamManagerRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "team_manager_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "manager_id" UUID NOT NULL,
    "request_type" "TeamManagerRequestType" NOT NULL,
    "status" "TeamManagerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "team_id" UUID,
    "proposed_team_name" TEXT,
    "proposed_team_short_name" TEXT,
    "proposed_team_city" TEXT,
    "proposed_team_logo_url" TEXT,
    "proposed_stadium_id" UUID,
    "request_note" TEXT,
    "admin_note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_manager_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_manager_requests_manager_id_idx" ON "team_manager_requests"("manager_id");

-- CreateIndex
CREATE INDEX "team_manager_requests_team_id_idx" ON "team_manager_requests"("team_id");

-- CreateIndex
CREATE INDEX "team_manager_requests_status_idx" ON "team_manager_requests"("status");

-- CreateIndex
CREATE INDEX "team_manager_requests_request_type_idx" ON "team_manager_requests"("request_type");

-- CreateIndex
CREATE INDEX "team_manager_requests_reviewed_by_id_idx" ON "team_manager_requests"("reviewed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_manager_requests_one_pending_per_manager_idx"
ON "team_manager_requests"("manager_id")
WHERE "status" = 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "team_manager_requests_one_pending_claim_per_team_idx"
ON "team_manager_requests"("team_id")
WHERE "status" = 'PENDING'
  AND "request_type" = 'CLAIM_EXISTING_TEAM'
  AND "team_id" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "team_manager_requests"
ADD CONSTRAINT "team_manager_requests_manager_id_fkey"
FOREIGN KEY ("manager_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_manager_requests"
ADD CONSTRAINT "team_manager_requests_team_id_fkey"
FOREIGN KEY ("team_id") REFERENCES "teams"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_manager_requests"
ADD CONSTRAINT "team_manager_requests_reviewed_by_id_fkey"
FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
