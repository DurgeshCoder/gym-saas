-- AlterTable
ALTER TABLE `gym` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `openingHours` JSON NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `socialLinks` JSON NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;
