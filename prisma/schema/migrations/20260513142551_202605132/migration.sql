/*
  Warnings:

  - You are about to drop the column `mainColor` on the `pages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pages" DROP COLUMN "mainColor",
ADD COLUMN     "color_pallete" JSONB NOT NULL DEFAULT '{"ultra_light":"","tint":"","original":"","shade":"","deep":""}',
ADD COLUMN     "main_color" TEXT NOT NULL DEFAULT '';
