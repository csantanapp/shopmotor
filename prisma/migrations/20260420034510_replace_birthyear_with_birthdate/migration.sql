/*
  Warnings:

  - You are about to drop the column `birthYear` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "birthYear",
ADD COLUMN     "birthDate" TIMESTAMP(3);
