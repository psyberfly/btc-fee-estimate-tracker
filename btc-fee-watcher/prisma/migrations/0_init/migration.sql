-- CreateTable
CREATE TABLE "FeeEstimates" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "satsPerByte" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeEstimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingAverages" (
    "id" SERIAL NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "last365Days" DECIMAL(65,30) NOT NULL,
    "last30Days" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovingAverages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovingAverageFeeEstimates" (
    "feeEstimateId" INTEGER NOT NULL,
    "movingAverageId" INTEGER NOT NULL,

    CONSTRAINT "MovingAverageFeeEstimates_pkey" PRIMARY KEY ("feeEstimateId","movingAverageId")
);

-- CreateTable
CREATE TABLE "FeeIndexes" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "feeEstimateId" INTEGER NOT NULL,
    "movingAverageId" INTEGER NOT NULL,
    "ratioLast365Days" DECIMAL(65,30) NOT NULL,
    "ratioLast30Days" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeIndexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeEstimatesArchive" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "avgSatsPerByte" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeEstimatesArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeIndexesArchive" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "avgRatioLast365Days" DECIMAL(65,30) NOT NULL,
    "avgRatioLast30Days" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeIndexesArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeEstimates_time_key" ON "FeeEstimates"("time");

-- CreateIndex
CREATE UNIQUE INDEX "MovingAverages_day_key" ON "MovingAverages"("day");

-- CreateIndex
CREATE UNIQUE INDEX "FeeIndexes_time_key" ON "FeeIndexes"("time");

-- CreateIndex
CREATE UNIQUE INDEX "FeeIndexes_feeEstimateId_key" ON "FeeIndexes"("feeEstimateId");

-- AddForeignKey
ALTER TABLE "MovingAverageFeeEstimates" ADD CONSTRAINT "MovingAverageFeeEstimates_feeEstimateId_fkey" FOREIGN KEY ("feeEstimateId") REFERENCES "FeeEstimates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovingAverageFeeEstimates" ADD CONSTRAINT "MovingAverageFeeEstimates_movingAverageId_fkey" FOREIGN KEY ("movingAverageId") REFERENCES "MovingAverages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeIndexes" ADD CONSTRAINT "FeeIndexes_feeEstimateId_fkey" FOREIGN KEY ("feeEstimateId") REFERENCES "FeeEstimates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "FeeIndexes" ADD CONSTRAINT "FeeIndexes_movingAverageId_fkey" FOREIGN KEY ("movingAverageId") REFERENCES "MovingAverages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

