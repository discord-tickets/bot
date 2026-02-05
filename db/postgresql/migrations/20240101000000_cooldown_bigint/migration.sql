-- AlterTable
-- Change cooldown column from INTEGER to BIGINT to support large cooldown values (e.g., 30d = 2592000000ms)
ALTER TABLE "categories" ALTER COLUMN "cooldown" TYPE BIGINT;
