import loki from "lokijs";
import { ChartType } from "../chart_data/interface";

const db = new loki("btcfee.db", {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000,
});

function databaseInitialize() {
  let feeIndex = db.getCollection(ChartType.feeIndex);
  if (feeIndex === null) {
    db.addCollection(ChartType.feeIndex, { indices: ["time"] });
  }

  let movingAverages = db.getCollection(ChartType.movingAverage);
  if (movingAverages === null) {
    db.addCollection(ChartType.movingAverage, { indices: ["time"] });
  }

  let feeEstimates = db.getCollection(ChartType.feeEstimate);
  if (feeEstimates === null) {
    db.addCollection(ChartType.feeEstimate, { indices: ["time"] });
  }
}

export { db };
