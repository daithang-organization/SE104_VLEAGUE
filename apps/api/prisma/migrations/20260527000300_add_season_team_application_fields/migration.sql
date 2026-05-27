-- AlterTable
ALTER TABLE "season_teams"
ADD COLUMN "owner_name" TEXT,
ADD COLUMN "owner_country" TEXT,
ADD COLUMN "owner_address" TEXT,
ADD COLUMN "team_introduction" TEXT,
ADD COLUMN "primary_kit" TEXT,
ADD COLUMN "backup_kit" TEXT,
ADD COLUMN "participation_fee_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "fee_paid_at" TIMESTAMP(3),
ADD COLUMN "fee_receipt_code" TEXT,
ADD COLUMN "external_competition_schedule" TEXT,
ADD COLUMN "application_submitted_at" TIMESTAMP(3),
ADD COLUMN "application_review_note" TEXT;
