import { FeeEstimates, FeeIndexes } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export function calculateFeeEstimateWeightedAverage(
  feeHistory: FeeEstimates[],
): Decimal {
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < feeHistory.length - 1; i++) {
    const stepSizeHours =
      (feeHistory[i + 1].time.getTime() - feeHistory[i].time.getTime()) /
      (1000 * 60 * 60); // Difference in hours
    const weight = stepSizeHours; // Directly using step size in hours as weight
    weightedSum += feeHistory[i].satsPerByte.toNumber() * weight;
    totalWeight += weight;
  }

  // Handle last reading separately (assuming average of total weight as the penultimate step or default to 1 if only one reading)
  const lastWeight = totalWeight > 0
    ? totalWeight / (feeHistory.length - 1)
    : 1;
  weightedSum += feeHistory[feeHistory.length - 1].satsPerByte.toNumber() *
    lastWeight;
  totalWeight += lastWeight;

  const weightedMovingAverage = new Decimal(weightedSum / totalWeight);
  return weightedMovingAverage;
}


export function calculateFeeIndexWeightedAverage(
    feeHistory: FeeIndexes[],
  ): { weightedAverage30Days: Decimal; weightedAverage365Days: Decimal } {
    let weightedSum30Days = 0;
    let weightedSum365Days = 0;
    let totalWeight = 0;
  
    for (let i = 0; i < feeHistory.length - 1; i++) {
      const stepSizeHours =
        (feeHistory[i + 1].time.getTime() - feeHistory[i].time.getTime()) /
        (1000 * 60 * 60); // Difference in hours
      const weight = stepSizeHours; // Directly using step size in hours as weight
      weightedSum30Days += feeHistory[i].ratioLast30Days.toNumber() * weight;
      weightedSum365Days += feeHistory[i].ratioLast365Days.toNumber() * weight;
      totalWeight += weight;
    }
  
    // Handle last reading separately (assuming average of total weight as the penultimate step or default to 1 if only one reading)
    const lastWeight = totalWeight > 0
      ? totalWeight / (feeHistory.length - 1)
      : 1;
    weightedSum30Days += feeHistory[feeHistory.length - 1].ratioLast30Days.toNumber() * lastWeight;
    weightedSum365Days += feeHistory[feeHistory.length - 1].ratioLast365Days.toNumber() * lastWeight;
    totalWeight += lastWeight;
  
    const weightedAverage30Days = new Decimal(weightedSum30Days / totalWeight);
    const weightedAverage365Days = new Decimal(weightedSum365Days / totalWeight);
  
    return {
      weightedAverage30Days,
      weightedAverage365Days,
    };
  }