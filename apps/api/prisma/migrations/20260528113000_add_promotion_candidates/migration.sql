-- CreateEnum
CREATE TYPE "PromotionQualificationType" AS ENUM ('CHAMPION', 'RUNNER_UP', 'PLAYOFF', 'REPLACEMENT_POOL');

-- CreateEnum
CREATE TYPE "PromotionCandidateStatus" AS ENUM ('ELIGIBLE', 'INVITED', 'ACCEPTED', 'DECLINED', 'SKIPPED');

-- CreateTable
CREATE TABLE "promotion_candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "season_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "source_competition" TEXT NOT NULL,
    "qualification_type" "PromotionQualificationType" NOT NULL DEFAULT 'RUNNER_UP',
    "status" "PromotionCandidateStatus" NOT NULL DEFAULT 'ELIGIBLE',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_candidates_season_id_idx" ON "promotion_candidates"("season_id");

-- CreateIndex
CREATE INDEX "promotion_candidates_status_idx" ON "promotion_candidates"("status");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_candidates_season_id_team_id_key" ON "promotion_candidates"("season_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_candidates_season_id_rank_key" ON "promotion_candidates"("season_id", "rank");

-- AddForeignKey
ALTER TABLE "promotion_candidates" ADD CONSTRAINT "promotion_candidates_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_candidates" ADD CONSTRAINT "promotion_candidates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
