/*
  Warnings:

  - A unique constraint covering the columns `[razorpayOrderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Gym` ADD COLUMN `razorpayKeyId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayKeySecret` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `razorpayOrderId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayPaymentId` VARCHAR(191) NULL,
    ADD COLUMN `razorpaySignature` VARCHAR(191) NULL,
    MODIFY `paymentMethod` ENUM('CARD', 'CASH', 'PAYPAL', 'RAZORPAY') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_razorpayOrderId_key` ON `Payment`(`razorpayOrderId`);

-- CreateIndex
CREATE UNIQUE INDEX `Payment_razorpayPaymentId_key` ON `Payment`(`razorpayPaymentId`);
