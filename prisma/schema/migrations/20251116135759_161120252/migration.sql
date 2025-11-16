-- CreateEnum
CREATE TYPE "OngCategory" AS ENUM ('Animais', 'Meio Ambiente', 'Educação', 'Saúde', 'Direitos Humanos', 'Combate à Fome', 'Crianças e Adolescentes', 'Idosos', 'Pessoas com Deficiência', 'Moradores de Rua', 'Igualdade de Gênero', 'Refugiados e Imigrantes', 'Proteção Animal', 'Desenvolvimento Comunitário', 'Cultura e Arte', 'Esporte e Inclusão', 'Voluntariado e Doações', 'Tecnologia Social', 'Direitos das Mulheres', 'Outros');

-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('super_admin', 'admin', 'editor');

-- AlterTable
ALTER TABLE "organizations_profiles" ADD COLUMN     "ong_type" "OngCategory";

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT NOT NULL,
    "organizationProfileId" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_organizationProfileId_fkey" FOREIGN KEY ("organizationProfileId") REFERENCES "organizations_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
