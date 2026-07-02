-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "current_value" SET DEFAULT 0,
ALTER COLUMN "location" DROP NOT NULL;
