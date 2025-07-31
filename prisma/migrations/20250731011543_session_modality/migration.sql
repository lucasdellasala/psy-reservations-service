/*
  Warnings:

  - Added the required column `modality` to the `availability_windows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modality` to the `session_types` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SessionModality" AS ENUM ('online', 'in_person');

-- AlterTable
ALTER TABLE "public"."availability_windows" ADD COLUMN     "modality" "public"."SessionModality";

-- AlterTable
ALTER TABLE "public"."session_types" ADD COLUMN     "modality" "public"."SessionModality";

-- Update existing records with default values
UPDATE "public"."availability_windows" SET "modality" = 'online' WHERE "modality" IS NULL;
UPDATE "public"."session_types" SET "modality" = 'online' WHERE "modality" IS NULL;

-- Make columns NOT NULL after setting default values
ALTER TABLE "public"."availability_windows" ALTER COLUMN "modality" SET NOT NULL;
ALTER TABLE "public"."session_types" ALTER COLUMN "modality" SET NOT NULL;
