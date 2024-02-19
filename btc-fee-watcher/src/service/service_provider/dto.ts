import { r_500 } from "../../lib/logger/winston";
import { filterError, parseRequest, respond } from "../../lib/http/handler";
import { ServiceProvider } from "./service_provider";

const serviceProvider = new ServiceProvider();

export async function handleGetIndex(req, res) {
  const request = parseRequest(req);
  try {
    let index = await serviceProvider.getIndex();

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
    let indexView = await serviceProvider.getIndexHistory();

    if (indexView instanceof Error) {
      throw indexView;
    }
    res.send(indexView);
    //    await respond(200, indexView, res, request);
  } catch (e) {
    const result = filterError(e, r_500, request);
    await respond(result.code, result.message, res, request);
  }
}
