ALTER TABLE `Product`
    MODIFY `imageUrl` TEXT NULL,
    ADD COLUMN `imageAssets` JSON NULL;

ALTER TABLE `Banner`
    MODIFY `imageUrl` TEXT NOT NULL,
    ADD COLUMN `imageAsset` JSON NULL;
