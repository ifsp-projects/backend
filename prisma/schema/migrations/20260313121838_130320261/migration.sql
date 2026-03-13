-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'inactive',
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "addresses_organization_profile_id_idx" ON "addresses"("organization_profile_id");

-- CreateIndex
CREATE INDEX "addresses_deleted_at_idx" ON "addresses"("deleted_at");

-- CreateIndex
CREATE INDEX "organizations_account_status_idx" ON "organizations"("account_status");

-- CreateIndex
CREATE INDEX "organizations_deleted_at_idx" ON "organizations"("deleted_at");

-- CreateIndex
CREATE INDEX "organizations_profiles_ong_type_idx" ON "organizations_profiles"("ong_type");
