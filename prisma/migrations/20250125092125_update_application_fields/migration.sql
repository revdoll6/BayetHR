-- AlterTable
ALTER TABLE `applications` ADD COLUMN `certificate_urls` JSON NULL,
    ADD COLUMN `certifications` JSON NOT NULL,
    ADD COLUMN `cv_url` VARCHAR(191) NULL,
    ADD COLUMN `experience` JSON NOT NULL,
    ADD COLUMN `languages` JSON NOT NULL,
    ADD COLUMN `profile_image_url` VARCHAR(191) NULL,
    ADD COLUMN `softSkills` JSON NOT NULL;

-- CreateTable
CREATE TABLE `educations` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NULL,
    `institution` VARCHAR(191) NOT NULL,
    `field_of_study` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `application_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `educations` ADD CONSTRAINT `educations_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
