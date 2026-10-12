-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PELAPOR', 'APPROVER');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PELAPOR';

-- CreateIndex
CREATE INDEX "Report_decidedById_idx" ON "Report"("decidedById");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
