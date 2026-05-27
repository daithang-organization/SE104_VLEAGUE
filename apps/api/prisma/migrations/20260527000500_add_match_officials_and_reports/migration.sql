-- P4: match officials, referee reports, and discipline reports

CREATE TYPE "OfficialStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "MatchOfficialRole" AS ENUM ('MAIN_REFEREE', 'ASSISTANT_REFEREE', 'FOURTH_OFFICIAL', 'SUPERVISOR');

CREATE TABLE "officials" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "OfficialStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "officials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "match_official_assignments" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "official_id" UUID NOT NULL,
    "role" "MatchOfficialRole" NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_official_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "match_reports" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "submitted_by_user_id" UUID,
    "home_score" INTEGER NOT NULL,
    "away_score" INTEGER NOT NULL,
    "best_player_id" UUID,
    "technical_stats" JSONB,
    "note" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "discipline_reports" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "supervisor_id" UUID NOT NULL,
    "organization_rating" TEXT NOT NULL,
    "referee_issues" TEXT,
    "player_issues" TEXT,
    "organizer_issues" TEXT,
    "notes" TEXT,
    "sent_to_disciplinary_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discipline_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "officials_status_idx" ON "officials"("status");

CREATE UNIQUE INDEX "match_official_assignments_match_id_official_id_role_key"
ON "match_official_assignments"("match_id", "official_id", "role");
CREATE INDEX "match_official_assignments_match_id_idx" ON "match_official_assignments"("match_id");
CREATE INDEX "match_official_assignments_official_id_idx" ON "match_official_assignments"("official_id");
CREATE INDEX "match_official_assignments_role_idx" ON "match_official_assignments"("role");

CREATE UNIQUE INDEX "match_reports_match_id_key" ON "match_reports"("match_id");
CREATE INDEX "match_reports_best_player_id_idx" ON "match_reports"("best_player_id");
CREATE INDEX "match_reports_submitted_by_user_id_idx" ON "match_reports"("submitted_by_user_id");

CREATE UNIQUE INDEX "discipline_reports_match_id_key" ON "discipline_reports"("match_id");
CREATE INDEX "discipline_reports_supervisor_id_idx" ON "discipline_reports"("supervisor_id");

ALTER TABLE "match_official_assignments"
ADD CONSTRAINT "match_official_assignments_match_id_fkey"
FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "match_official_assignments"
ADD CONSTRAINT "match_official_assignments_official_id_fkey"
FOREIGN KEY ("official_id") REFERENCES "officials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "match_reports"
ADD CONSTRAINT "match_reports_match_id_fkey"
FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "match_reports"
ADD CONSTRAINT "match_reports_best_player_id_fkey"
FOREIGN KEY ("best_player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "discipline_reports"
ADD CONSTRAINT "discipline_reports_match_id_fkey"
FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "discipline_reports"
ADD CONSTRAINT "discipline_reports_supervisor_id_fkey"
FOREIGN KEY ("supervisor_id") REFERENCES "officials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
