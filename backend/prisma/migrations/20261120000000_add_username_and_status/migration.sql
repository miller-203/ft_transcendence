CREATE TYPE "Status" AS ENUM ('ACTIVE', 'BANNED');

ALTER TABLE "User" ADD COLUMN "status" "Status" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "username" TEXT;

UPDATE "User" SET "username" = 'user_' || "id"::TEXT;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
