## Explanation of the math used: 


### Watcher Process:

```mermaid
graph TD
    A(Start Process) --> B[Load historic fee estimates from 2020 up to now into DB]
    B --> C[For each day, fee estimate in history, seed: moving average, fee index to DB]
    C --> Z(Start Index Watcher)
    C --> Y(Start API)
    Z --> D(Wait 10m)
    D --> G(Fetch Current Fee Estimate from mempool.space)
    G --> H(Create Fee Estimate Index = current Fee Estimate / today's Moving Average)
    H --> I[Store Fee Estimate, Moving Average, and Fee Estimate Index in DB]
    I --> D
    Z --> J(Wait 6h)
    J --> K{Have 6h passed?}
    K -->|Yes| L[Compress Fee Estimate and Fee Index Readings of Previous 6h]
    L --> M[Store Compressed readings in DB]
    M --> J
    K -->|No| J
    Z --> N(Wait 1 day)
    N --> E{Has the day changed?}
    E -->|Yes| F[Create Moving Average = sum of weighted Fee Estimates last 365 days / total weight]
    F --> N
    E -->|No| N
    Y --> Y1[Serve Routes:]
    Y1 --> O(Serve Current Fee Index)
    O --> P(Serve Fee Index History)
    P --> Q(Serve Fee Index WebSocket)
```

### Moving Average formula:

    async create(day: Date): Promise<boolean | Error> {
    try {
      const calculateWeightedAverage = (
        feeHistory: Array<{ id: number; time: Date; satsPerByte: Decimal }>,
      ) => {
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
        weightedSum +=
          feeHistory[feeHistory.length - 1].satsPerByte.toNumber() * lastWeight;
        totalWeight += lastWeight;

        const weightedMovingAverage = new Decimal(weightedSum / totalWeight);
        return weightedMovingAverage;
      };

      const feeHistoryLast365Days = await this.feeOp.readLast365Days(day);

      if (feeHistoryLast365Days instanceof Error) {
        return feeHistoryLast365Days;
      }
      if (feeHistoryLast365Days.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }
      const averageLast365Days = calculateWeightedAverage(
        feeHistoryLast365Days,
      );

      const feeHistoryLast30Days = await this.feeOp.readLast30Days(day);
      if (feeHistoryLast30Days instanceof Error) {
        return feeHistoryLast30Days;
      }
      if (feeHistoryLast30Days.length === 0) {
        throw new Error("Array is empty, cannot calculate average.");
      }
      const averageLast30Days = calculateWeightedAverage(feeHistoryLast30Days);

      const update: MovingAverages = {
        id: null, // Added by DB
        day: day,
        createdAt: null, //Added by DB,
        last365Days: averageLast365Days,
        last30Days: averageLast30Days,
      };

      this.store.insert(update);
      return true;
    } catch (e) {
      return handleError(e);
    }
  }

### Fee Index formula: 

     async create(feeEstimate: FeeEstimates): Promise<boolean | Error> {
      try {
        const movingAverage = await this.movingAvgStore.readByDay(
          feeEstimate.time,
        );

      if (!movingAverage) {
        console.error(`No moving averge for fee est: ${feeEstimate.time}`);
        return true;
      }

      if (
        !(movingAverage instanceof Error) &&
        movingAverage
      ) {
        const ratioLast365Days = feeEstimate.satsPerByte.toNumber() /
          movingAverage.last365Days.toNumber();

        const ratioLast30Days = feeEstimate.satsPerByte.toNumber() /
          movingAverage.last30Days.toNumber();

        const index: FeeIndexes = {
          id: null, //added by DB
          time: feeEstimate.time,
          feeEstimateId: feeEstimate.id,
          movingAverageId: movingAverage.id,
          ratioLast365Days: new Decimal(ratioLast365Days),
          ratioLast30Days: new Decimal(ratioLast30Days),
          createdAt: null, //added by DB
        };

        const res = await this.store.insert(index);
        if (res instanceof Error) {
          console.error(`Error inserting fee index: ${res}`);
          const feeEstId = feeEstimate.id;
          throw res;
        }
      }
      return true;
    } catch (e) {
      return handleError(e);
    }
    }

