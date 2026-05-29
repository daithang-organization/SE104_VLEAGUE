-- CreateTable
CREATE TABLE "draw_lot_results" (
    "id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "resolved_rank" INTEGER NOT NULL,
    "note" TEXT,
    "resolved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_by" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_lot_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "draw_lot_results_season_id_idx" ON "draw_lot_results"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "draw_lot_results_season_id_team_id_key" ON "draw_lot_results"("season_id", "team_id");

-- AddForeignKey
ALTER TABLE "draw_lot_results" ADD CONSTRAINT "draw_lot_results_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draw_lot_results" ADD CONSTRAINT "draw_lot_results_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
