/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "device_name" TEXT,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "last_used_at" TIMESTAMP(3),
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
