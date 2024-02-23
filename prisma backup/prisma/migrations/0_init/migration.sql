-- CreateTable
CREATE TABLE "FeeEstimate" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "satsPerByte" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "FeeEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingAverage" (
    "id" SERIAL NOT NULL,
    "last365Days" DECIMAL(65,30) NOT NULL,
    "last30Days" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovingAverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeIndex" (
    "id" SERIAL NOT NULL,
    "feeEstimateId" INTEGER NOT NULL,
    "movingAverageId" INTEGER NOT NULL,
    "ratioLast365Days" DECIMAL(65,30) NOT NULL,
    "ratioLast30Days" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeIndex_feeEstimateId_key" ON "FeeIndex"("feeEstimateId");

-- AddForeignKey
ALTER TABLE "FeeIndex" ADD CONSTRAINT "FeeIndex_feeEstimateId_fkey" FOREIGN KEY ("feeEstimateId") REFERENCES "FeeEstimate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FeeIndex" ADD CONSTRAINT "FeeIndex_movingAverageId_fkey" FOREIGN KEY ("movingAverageId") REFERENCES "MovingAverage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

