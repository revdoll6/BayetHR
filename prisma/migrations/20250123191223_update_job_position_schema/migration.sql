/*
  Warnings:

  - You are about to drop the column `address` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `certificate_urls` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `cv_url` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `profile_image_url` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `softSkills` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `technicalSkills` on the `applications` table. All the data in the column will be lost.
  - Added the required column `birth_certificate_number` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birth_date` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commune_id` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_position_id` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wilaya_id` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `applications` DROP COLUMN `address`,
    DROP COLUMN `certificate_urls`,
    DROP COLUMN `certifications`,
    DROP COLUMN `city`,
    DROP COLUMN `country`,
    DROP COLUMN `cv_url`,
    DROP COLUMN `domain`,
    DROP COLUMN `education`,
    DROP COLUMN `experience`,
    DROP COLUMN `languages`,
    DROP COLUMN `phone`,
    DROP COLUMN `profile_image_url`,
    DROP COLUMN `softSkills`,
    DROP COLUMN `specialization`,
    DROP COLUMN `technicalSkills`,
    ADD COLUMN `birth_certificate_number` VARCHAR(191) NOT NULL,
    ADD COLUMN `birth_date` DATETIME(3) NOT NULL,
    ADD COLUMN `commune_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `first_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `job_position_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `last_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `mobile` VARCHAR(191) NOT NULL,
    ADD COLUMN `photo` VARCHAR(191) NULL,
    ADD COLUMN `wilaya_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('RH', 'DRH') NOT NULL DEFAULT 'RH',
    `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_positions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ar_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_position_id_fkey` FOREIGN KEY (`job_position_id`) REFERENCES `job_positions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
