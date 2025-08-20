import { r_500 } from "../../lib/logger/winston";
import { filterError, parseRequest, respond } from "../../lib/http/handler";
import { ApiService } from "./api";
import { isFiveMonthsAgoOrMore } from "../../lib/date/date";
import { categorizeByTwoBucketPercentile, percentHigher, percentileRank, winsorize } from "../../lib/math/percentile";

const apiService = new ApiService();

export async function handleGetIndex(req, res) {
  const request = parseRequest(req);
  try {
    let index = await apiService.getIndex();

    if (index instanceof Error) {
      throw index;
    }
    await respond(200, index, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}

export async function handleGetIndexDetailed(req, res) {
  const request = parseRequest(req);
  try {
    let index = await apiService.getIndexDetailed();

    if (index instanceof Error) {
      throw index;
    }
    await respond(200, index, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}

export async function handleGetIndexHistory(req, res) {
  const request = parseRequest(req);

  try {
    const since = parseInt(req.query["since"], 10);

    if (isNaN(since)) {
      await respond(
        400,
        "Missing or invalid query param since (Unix timestamp)",
        res,
        request,
      );
      return;
    }

    let indexHistory = await apiService.getIndexHistory(new Date(since));

    if (indexHistory instanceof Error) {
      throw indexHistory;
    }

    await respond(200, indexHistory, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}

export async function handleGetMovingAverageHistory(req, res) {
  const request = parseRequest(req);

  try {
    const since = parseInt(req.query["since"], 10);

    if (isNaN(since)) {
      await respond(
        400,
        "Missing or invalid query param since (Unix timestamp)",
        res,
        request,
      );
      return;
    }

    let movingAverageHistory = await apiService.getMovingAverageHistory(
      new Date(since),
    );

    if (movingAverageHistory instanceof Error) {
      throw movingAverageHistory;
    }
    //res.send(movingAverageHistory);
    await respond(200, movingAverageHistory, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}

export async function handleGetFeeEstimateHistory(req, res) {
  const request = parseRequest(req);
  try {
    const since = parseInt(req.query["since"], 10);

    if (isNaN(since)) {
      await respond(
        400,
        "Missing or invalid query param since (Unix timestamp)",
        res,
        request,
      );
      return;
    }

    let feeEstHistory = await apiService.getFeeEstimateHistory(new Date(since));

    if (feeEstHistory instanceof Error) {
      throw feeEstHistory;
    }

    //res.send(feeEstHistory);
    await respond(200, feeEstHistory, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}

export async function handleGetIndexDetailedHistory(req, res) {
  const request = parseRequest(req);
  try {
    let startDate: Date;
    const from = parseInt(req.query["fromDate"], 10);

    if (isNaN(from)) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
    } else {
      startDate = new Date(from);
    }

    let indexHistory = await apiService.getIndexDetailedHistory(
      startDate,
    );

    if (indexHistory instanceof Error) {
      throw indexHistory;
    }
    res.send(indexHistory);
    //    await respond(200, indexView, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}

export async function handleGetGaugeStats(req, res) {
  const request = parseRequest(req);
  try {
    // Use latest detailed index (provides current fee, moving averages, ratios)
    const apiService = new ApiService();
    const latest = await apiService.getIndexDetailed();
    if (latest instanceof Error) throw latest;

    // Read historical series
    const now = new Date();
    const since365 = new Date(now.getTime()); since365.setDate(since365.getDate() - 365);
    const since30 = new Date(now.getTime()); since30.setDate(since30.getDate() - 30);

    const indexHistory365 = await apiService.getIndexHistory(since365);
    const indexHistory30 = await apiService.getIndexHistory(since30);
    const feeHistory365 = await apiService.getFeeEstimateHistory(since365);
    const feeHistory30 = await apiService.getFeeEstimateHistory(since30);

    if (
      indexHistory365 instanceof Error ||
      indexHistory30 instanceof Error ||
      feeHistory365 instanceof Error ||
      feeHistory30 instanceof Error
    ) {
      throw new Error("Error fetching history");
    }

    // Build series of ratios and fees
    const ratios365 = indexHistory365.map((e) => Number(e.ratioLast365Days)).filter(Number.isFinite);
    const ratios30 = indexHistory30.map((e) => Number(e.ratioLast30Days)).filter(Number.isFinite);
    const fees365 = feeHistory365.map((e) => Number(e.satsPerByte)).filter(Number.isFinite);
    const fees30 = feeHistory30.map((e) => Number(e.satsPerByte)).filter(Number.isFinite);

    // Winsorize
    const { data: ratios365W } = winsorize(ratios365);
    const { data: ratios30W } = winsorize(ratios30);
    const { data: fees365W } = winsorize(fees365);
    const { data: fees30W } = winsorize(fees30);

    const R365 = latest.feeEstimateMovingAverageRatio.last365Days;
    const R30 = latest.feeEstimateMovingAverageRatio.last30Days;
    const feeNow = latest.currentFeeEstimate.satsPerByte;

    const gauge365 = {
      label: categorizeByTwoBucketPercentile(R365, ratios365W),
      multiple: R365,
      percentile: percentileRank(ratios365W, R365),
      rawFeePercentile: percentileRank(fees365W, feeNow),
    };
    const gauge30 = {
      label: categorizeByTwoBucketPercentile(R30, ratios30W),
      multiple: R30,
      percentile: percentileRank(ratios30W, R30),
      rawFeePercentile: percentileRank(fees30W, feeNow),
    };

    await respond(200, { gauge365, gauge30 }, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}

export async function handleGetSummary(req, res) {
  const request = parseRequest(req);
  try {
    const apiService = new ApiService();
    const latest = await apiService.getIndexDetailed();
    if (latest instanceof Error) throw latest;

    const now = new Date();
    const since365 = new Date(now.getTime()); since365.setDate(since365.getDate() - 365);
    const since30 = new Date(now.getTime()); since30.setDate(since30.getDate() - 30);

    const indexHistory365 = await apiService.getIndexHistory(since365);
    const indexHistory30 = await apiService.getIndexHistory(since30);
    const feeHistory365 = await apiService.getFeeEstimateHistory(since365);
    const feeHistory30 = await apiService.getFeeEstimateHistory(since30);

    if (
      indexHistory365 instanceof Error ||
      indexHistory30 instanceof Error ||
      feeHistory365 instanceof Error ||
      feeHistory30 instanceof Error
    ) {
      throw new Error("Error fetching history");
    }

    const ratios365 = indexHistory365.map((e) => Number(e.ratioLast365Days)).filter(Number.isFinite);
    const ratios30 = indexHistory30.map((e) => Number(e.ratioLast30Days)).filter(Number.isFinite);
    const fees365 = feeHistory365.map((e) => Number(e.satsPerByte)).filter(Number.isFinite);
    const fees30 = feeHistory30.map((e) => Number(e.satsPerByte)).filter(Number.isFinite);

    const { data: ratios365W } = winsorize(ratios365);
    const { data: ratios30W } = winsorize(ratios30);
    const { data: fees365W } = winsorize(fees365);
    const { data: fees30W } = winsorize(fees30);

    const R365 = latest.feeEstimateMovingAverageRatio.last365Days;
    const R30 = latest.feeEstimateMovingAverageRatio.last30Days;
    const feeNow = latest.currentFeeEstimate.satsPerByte;
    const avg365 = latest.movingAverage.last365Days;
    const avg30 = latest.movingAverage.last30Days;

    const gauge365 = {
      label: categorizeByTwoBucketPercentile(R365, ratios365W),
      multiple: R365,
      percentile: percentileRank(ratios365W, R365),
      higherThanPercent: percentHigher(ratios365W, R365),
      rawFeePercentile: percentileRank(fees365W, feeNow),
      rawFeeHigherThanPercent: percentHigher(fees365W, feeNow),
    };
    const gauge30 = {
      label: categorizeByTwoBucketPercentile(R30, ratios30W),
      multiple: R30,
      percentile: percentileRank(ratios30W, R30),
      higherThanPercent: percentHigher(ratios30W, R30),
      rawFeePercentile: percentileRank(fees30W, feeNow),
      rawFeeHigherThanPercent: percentHigher(fees30W, feeNow),
    };

    const body = {
      currentFee: feeNow,
      averages: {
        last365Days: avg365,
        last30Days: avg30,
      },
      multiples: {
        last365Days: R365,
        last30Days: R30,
      },
      gauge365,
      gauge30,
      timestamp: latest.time,
    };

    await respond(200, body, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}
