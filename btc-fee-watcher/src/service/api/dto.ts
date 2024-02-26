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
    let indexHistory = await apiService.getIndexHistory();

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

export async function handleGetFeeEstimateHistory(req, res) {
  const request = parseRequest(req);
  try {
    let feeEstHistory = await apiService.getFeeEstimateHistory();

    if (feeEstHistory instanceof Error) {
      throw feeEstHistory;
    }
    res.send(feeEstHistory);
    //    await respond(200, indexView, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}
