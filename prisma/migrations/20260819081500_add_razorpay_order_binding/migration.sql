-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "paymentReference" TEXT;
ALTER TABLE "Booking" ADD COLUMN "razorpayOrderId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "razorpayOrderId" TEXT;
