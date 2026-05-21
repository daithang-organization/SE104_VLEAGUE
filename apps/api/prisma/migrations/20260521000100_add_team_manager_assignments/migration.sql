CREATE TABLE "team_manager_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_manager_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "team_manager_assignments_user_id_season_id_key" ON "team_manager_assignments"("user_id", "season_id");
CREATE INDEX "team_manager_assignments_team_id_idx" ON "team_manager_assignments"("team_id");
CREATE INDEX "team_manager_assignments_season_id_idx" ON "team_manager_assignments"("season_id");

ALTER TABLE "team_manager_assignments" ADD CONSTRAINT "team_manager_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_manager_assignments" ADD CONSTRAINT "team_manager_assignments_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_manager_assignments" ADD CONSTRAINT "team_manager_assignments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
