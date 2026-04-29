/*
  Warnings:

  - Made the column `ong_description` on table `organizations_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "organizations_profiles" ALTER COLUMN "ong_description" SET NOT NULL,
ALTER COLUMN "ong_description" SET DEFAULT 'ONG sem descrição';
