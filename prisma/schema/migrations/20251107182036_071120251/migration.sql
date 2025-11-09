/*
  Warnings:

  - You are about to drop the column `createdAt` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `pages` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id]` on the table `pages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `pages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `pages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."pages" DROP CONSTRAINT "pages_organizationId_fkey";

-- DropIndex
DROP INDEX "public"."organizations_slug_key";

-- DropIndex
DROP INDEX "public"."pages_organizationId_key";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "slug",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "organizationId",
DROP COLUMN "updatedAt",
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "organizations_profiles" (
    "id" TEXT NOT NULL,
    "ong_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT NOT NULL,

    CONSTRAINT "organizations_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_profiles_ong_id_key" ON "organizations_profiles"("ong_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_profiles_slug_key" ON "organizations_profiles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_organization_id_key" ON "pages"("organization_id");

-- AddForeignKey
ALTER TABLE "organizations_profiles" ADD CONSTRAINT "organizations_profiles_ong_id_fkey" FOREIGN KEY ("ong_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
