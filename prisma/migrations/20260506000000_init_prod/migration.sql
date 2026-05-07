-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `garmentType` VARCHAR(191) NOT NULL,
    `gender` ENUM('MUJER', 'HOMBRE', 'UNISEX', 'NINOS') NOT NULL,
    `productModel` VARCHAR(191) NULL,
    `size` VARCHAR(191) NOT NULL,
    `sizeFrom` VARCHAR(191) NULL,
    `sizeTo` VARCHAR(191) NULL,
    `isOneSize` BOOLEAN NOT NULL DEFAULT false,
    `predominantColor` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `imageUrls` JSON NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `inquiryCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Product_gender_idx`(`gender`),
    INDEX `Product_garmentType_idx`(`garmentType`),
    INDEX `Product_predominantColor_idx`(`predominantColor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleColor` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `subtitleColor` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `targetUrl` VARCHAR(191) NULL,
    `placement` ENUM('HERO', 'SECONDARY') NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Banner_placement_isActive_sortOrder_idx`(`placement`, `isActive`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `comment` TEXT NOT NULL,
    `ipHash` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'READ', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactMessage_ipHash_createdAt_idx`(`ipHash`, `createdAt`),
    INDEX `ContactMessage_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsappSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `phone` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `productMessage` VARCHAR(191) NULL,
    `bubbleLabel` VARCHAR(191) NULL,
    `productCta` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` ENUM('OWNER', 'MANAGER') NOT NULL DEFAULT 'MANAGER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
