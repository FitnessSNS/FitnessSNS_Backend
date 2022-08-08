/*
  Warnings:

  - A unique constraint covering the columns `[provider,provider_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "provider_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_provider_id_key" ON "User"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_provider_email_key" ON "User"("provider", "email");
