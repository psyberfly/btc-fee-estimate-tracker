import { r_500 } from "../../lib/logger/winston";
import { filterError, parseRequest, respond } from "../../lib/http/handler";
import { ApiService } from "./api";

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
