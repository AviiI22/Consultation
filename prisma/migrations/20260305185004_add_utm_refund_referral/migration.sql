-- Full schema creation + the 4 new columns, all in one safe migration.
-- This is the canonical migration for a fresh database deployment.

-- CreateTable
CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "consultationType" TEXT NOT NULL,
    "btrOption" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "consultationDate" TEXT NOT NULL,
    "consultationTime" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "tob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "concern" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "cashfreeOrderId" TEXT,
    "cashfreePaymentId" TEXT,
    "meetingLink" TEXT,
    "adminNotes" TEXT,
    "userTimezone" TEXT NOT NULL DEFAULT 'UTC',
    "adminTimezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "promoCode" TEXT,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "utmSource" TEXT,
    "refundStatus" TEXT,
    "refundAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Availability" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BlockedDate" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ServicePackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sessionCount" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserPackage" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "remainingSessions" INTEGER NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Waitlist" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Pricing" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "inrNormal40" INTEGER NOT NULL DEFAULT 7000,
    "inrUrgent40" INTEGER NOT NULL DEFAULT 21000,
    "inrNormal90" INTEGER NOT NULL DEFAULT 15000,
    "inrUrgent90" INTEGER NOT NULL DEFAULT 21000,
    "inrBtr" INTEGER NOT NULL DEFAULT 5000,
    "inrNormal" INTEGER NOT NULL DEFAULT 7000,
    "inrUrgent" INTEGER NOT NULL DEFAULT 21000,
    "usdNormal" INTEGER NOT NULL DEFAULT 30,
    "usdUrgent" INTEGER NOT NULL DEFAULT 60,
    "usdBtr" INTEGER NOT NULL DEFAULT 40,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (IF NOT EXISTS so it's safe to re-run)
CREATE UNIQUE INDEX IF NOT EXISTS "BlockedDate_date_key" ON "BlockedDate"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code");

-- AddForeignKey (safe — skips if already exists)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'UserPackage_packageId_fkey'
    ) THEN
        ALTER TABLE "UserPackage" ADD CONSTRAINT "UserPackage_packageId_fkey"
        FOREIGN KEY ("packageId") REFERENCES "ServicePackage"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Also safe-add columns for existing DBs that already have the base tables
-- (runs on upgrade path from old schema, no-ops on fresh install)
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "utmSource"    TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "refundStatus" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "refundAmount" INTEGER;
