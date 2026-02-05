-- AlterTable
-- Change cooldown column from INT to BIGINT to support large cooldown values (e.g., 30d = 2592000000ms)
ALTER TABLE `categories` MODIFY COLUMN `cooldown` BIGINT;
