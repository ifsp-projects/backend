-- AlterEnum
BEGIN;
CREATE TYPE "UserRoleEnum_new" AS ENUM ('member', 'admin');
ALTER TYPE "UserRoleEnum" RENAME TO "UserRoleEnum_old";
ALTER TYPE "UserRoleEnum_new" RENAME TO "UserRoleEnum";
DROP TYPE "public"."UserRoleEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "role" "UserRoleEnum" NOT NULL DEFAULT 'member';
