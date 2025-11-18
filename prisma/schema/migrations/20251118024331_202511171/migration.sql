/*
  Warnings:

  - You are about to drop the column `organizationProfileId` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."addresses" DROP CONSTRAINT "addresses_organizationProfileId_fkey";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "organizationProfileId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organization_profile_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_organization_profile_id_fkey" FOREIGN KEY ("organization_profile_id") REFERENCES "organizations_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
