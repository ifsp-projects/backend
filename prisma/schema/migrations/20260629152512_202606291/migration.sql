/*
  Warnings:

  - The `account_status` column on the `organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ong_type` column on the `organizations_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OngCategoryEnum" AS ENUM ('Animais', 'Meio Ambiente', 'Educação', 'Saúde', 'Direitos Humanos', 'Combate à Fome', 'Crianças e Adolescentes', 'Idosos', 'Pessoas com Deficiência', 'Moradores de Rua', 'Igualdade de Gênero', 'Refugiados e Imigrantes', 'Proteção Animal', 'Desenvolvimento Comunitário', 'Cultura e Arte', 'Esporte e Inclusão', 'Voluntariado e Doações', 'Tecnologia Social', 'Direitos das Mulheres', 'Outros');

-- CreateEnum
CREATE TYPE "AccountStatusEnum" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CampaignTypeEnum" AS ENUM ('Doação', 'Voluntariado', 'Evento', 'Conscientização', 'Projeto', 'Outro');

-- CreateEnum
CREATE TYPE "CampaignStatusEnum" AS ENUM ('Rascunho', 'Publicado', 'Ativa', 'Pausada', 'Finalizada', 'Cancelado');

-- CreateEnum
CREATE TYPE "CampaignGoalTypeEnum" AS ENUM ('Financeiro', 'Itens', 'Voluntários', 'Abaixo-assinado', 'Outro');

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "account_status",
ADD COLUMN     "account_status" "AccountStatusEnum" NOT NULL DEFAULT 'inactive';

-- AlterTable
ALTER TABLE "organizations_profiles" DROP COLUMN "ong_type",
ADD COLUMN     "ong_type" "OngCategoryEnum";

-- DropEnum
DROP TYPE "AccountStatus";

-- DropEnum
DROP TYPE "OngCategory";

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "ong_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "cover_image" TEXT,
    "banner_image" TEXT,
    "type" "CampaignTypeEnum" NOT NULL DEFAULT 'Outro',
    "status" "CampaignStatusEnum" NOT NULL DEFAULT 'Rascunho',
    "goal_type" "CampaignGoalTypeEnum" NOT NULL DEFAULT 'Outro',
    "goal_value" DECIMAL(15,2) NOT NULL,
    "current_value" DECIMAL(15,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organizations_account_status_idx" ON "organizations"("account_status");

-- CreateIndex
CREATE INDEX "organizations_profiles_ong_type_idx" ON "organizations_profiles"("ong_type");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_ong_id_fkey" FOREIGN KEY ("ong_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
