ALTER TABLE "users" ADD COLUMN "managed_team_id" UUID;

UPDATE "users" AS "u"
SET "managed_team_id" = "latest_assignment"."team_id"
FROM (
    SELECT DISTINCT ON ("user_id") "user_id", "team_id"
    FROM "team_manager_assignments"
    ORDER BY "user_id", "updated_at" DESC, "created_at" DESC
) AS "latest_assignment"
WHERE "u"."id" = "latest_assignment"."user_id"
  AND "u"."role" = 'TEAM_MANAGER';

CREATE INDEX "users_managed_team_id_idx" ON "users"("managed_team_id");

ALTER TABLE "users"
ADD CONSTRAINT "users_managed_team_id_fkey"
FOREIGN KEY ("managed_team_id") REFERENCES "teams"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
