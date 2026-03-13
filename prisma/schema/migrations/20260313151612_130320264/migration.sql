-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "password" TEXT NOT NULL DEFAULT 'p@ssw0rd';

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
