-- CreateEnum
CREATE TYPE "ManagerRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ManagerPlayerRequestType" AS ENUM ('ADD_PLAYER', 'UPDATE_PLAYER', 'REMOVE_FROM_TEAM');

-- CreateEnum
CREATE TYPE "ManagerStadiumRequestType" AS ENUM ('CREATE_HOME_STADIUM', 'UPDATE_HOME_STADIUM');

-- CreateTable
CREATE TABLE "manager_player_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "manager_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "player_id" UUID,
    "request_type" "ManagerPlayerRequestType" NOT NULL,
    "status" "ManagerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "request_note" TEXT,
    "admin_note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_player_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_stadium_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "manager_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "stadium_id" UUID,
    "request_type" "ManagerStadiumRequestType" NOT NULL,
    "status" "ManagerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "request_note" TEXT,
    "admin_note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_stadium_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manager_player_requests_manager_id_idx" ON "manager_player_requests"("manager_id");

-- CreateIndex
CREATE INDEX "manager_player_requests_team_id_idx" ON "manager_player_requests"("team_id");

-- CreateIndex
CREATE INDEX "manager_player_requests_player_id_idx" ON "manager_player_requests"("player_id");

-- CreateIndex
CREATE INDEX "manager_player_requests_status_idx" ON "manager_player_requests"("status");

-- CreateIndex
CREATE INDEX "manager_player_requests_request_type_idx" ON "manager_player_requests"("request_type");

-- CreateIndex
CREATE INDEX "manager_player_requests_reviewed_by_id_idx" ON "manager_player_requests"("reviewed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "manager_player_requests_one_pending_per_player_idx"
ON "manager_player_requests"("player_id")
WHERE "status" = 'PENDING'
  AND "request_type" IN ('UPDATE_PLAYER', 'REMOVE_FROM_TEAM')
  AND "player_id" IS NOT NULL;

-- CreateIndex
CREATE INDEX "manager_stadium_requests_manager_id_idx" ON "manager_stadium_requests"("manager_id");

-- CreateIndex
CREATE INDEX "manager_stadium_requests_team_id_idx" ON "manager_stadium_requests"("team_id");

-- CreateIndex
CREATE INDEX "manager_stadium_requests_stadium_id_idx" ON "manager_stadium_requests"("stadium_id");

-- CreateIndex
CREATE INDEX "manager_stadium_requests_status_idx" ON "manager_stadium_requests"("status");

-- CreateIndex
CREATE INDEX "manager_stadium_requests_request_type_idx" ON "manager_stadium_requests"("request_type");

-- CreateIndex
CREATE INDEX "manager_stadium_requests_reviewed_by_id_idx" ON "manager_stadium_requests"("reviewed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "manager_stadium_requests_one_pending_per_team_idx"
ON "manager_stadium_requests"("team_id")
WHERE "status" = 'PENDING';

-- AddForeignKey
ALTER TABLE "manager_player_requests"
ADD CONSTRAINT "manager_player_requests_manager_id_fkey"
FOREIGN KEY ("manager_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_player_requests"
ADD CONSTRAINT "manager_player_requests_team_id_fkey"
FOREIGN KEY ("team_id") REFERENCES "teams"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_player_requests"
ADD CONSTRAINT "manager_player_requests_player_id_fkey"
FOREIGN KEY ("player_id") REFERENCES "players"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_player_requests"
ADD CONSTRAINT "manager_player_requests_reviewed_by_id_fkey"
FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_stadium_requests"
ADD CONSTRAINT "manager_stadium_requests_manager_id_fkey"
FOREIGN KEY ("manager_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_stadium_requests"
ADD CONSTRAINT "manager_stadium_requests_team_id_fkey"
FOREIGN KEY ("team_id") REFERENCES "teams"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_stadium_requests"
ADD CONSTRAINT "manager_stadium_requests_stadium_id_fkey"
FOREIGN KEY ("stadium_id") REFERENCES "stadiums"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_stadium_requests"
ADD CONSTRAINT "manager_stadium_requests_reviewed_by_id_fkey"
FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
