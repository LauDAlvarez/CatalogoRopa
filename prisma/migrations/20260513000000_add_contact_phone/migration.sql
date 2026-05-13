ALTER TABLE `ContactMessage`
    ADD COLUMN `phone` VARCHAR(191) NOT NULL DEFAULT '' AFTER `email`;
