"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIndexWatcher = void 0;
const e_1 = require("../lib/errors/e");
const time_1 = require("../lib/time/time");
const fee_estimate_1 = require("../op/fee_estimate/fee_estimate");
const fee_index_1 = require("../op/fee_index/fee_index");
const moving_average_1 = require("../op/moving_average/moving_average");
const ws_1 = require("./ws");
function runIndexWatcher() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const feeOp = new fee_estimate_1.FeeOp();
            const movingAverageOp = new moving_average_1.MovingAverageOp();
            const indexOp = new fee_index_1.IndexOp();
            const port = process.env.WSS_PORT;
            const path = process.env.WSS_PATH;
            const alertStreamServer = new ws_1.AlertStreamServer(port, path);
            // every day:
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                console.log("Updating Moving Average...");
                const today = new Date().toISOString();
                const isExistMovingAvgToday = yield movingAverageOp.checkExists(today);
                if (!isExistMovingAvgToday) {
                    console.log("Creating Moving Average for today...");
                    const isMovingAvgCreated = yield movingAverageOp.create();
                    if (isMovingAvgCreated instanceof Error) {
                        console.error("Error creating Moving Average!");
                        return (0, e_1.handleError)(isMovingAvgCreated);
                    }
                    // update chart
                }
                else {
                    console.log("Moving Average already exists for today.");
                }
            }), time_1.ONE_MINUTE_MS //change to 24 hours for prod
            );
            // every 10 mins (block):
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                console.log("Updating latest Fee Estimate...");
                // fetch current fee estimate and update DB
                const currentFeeEstimate = yield feeOp.updateCurrent();
                if (currentFeeEstimate instanceof Error) {
                    console.error("Error updating Fee Estimate!");
                    return (0, e_1.handleError)(currentFeeEstimate);
                }
                console.log("Fee Estimate updated.");
                console.log("Updating latest Index...");
                // calculate index and update DB
                const isIndexUpdated = yield indexOp.udpateIndex();
                if (isIndexUpdated instanceof Error) {
                    console.error("Error updating Index!");
                    return (0, e_1.handleError)(isIndexUpdated);
                }
                console.log("Index updated.");
                const latestIndex = yield indexOp.readLatest();
                if (latestIndex instanceof Error) {
                    return (0, e_1.handleError)(latestIndex);
                }
                console.log("Broadcasting Index alert...");
                const isAlertBroadcast = alertStreamServer.broadcastAlert(latestIndex);
                if (isAlertBroadcast instanceof Error) {
                    console.error("Error broadcasting index alert!");
                    return (0, e_1.handleError)(latestIndex);
                }
                console.log("Index alert broadcasted");
                // update chart
            }), time_1.ONE_MINUTE_MS //change to ten mins for prod
            //TEN_MINUTES_MS
            );
        }
        catch (error) {
            console.error("Error starting server:", error);
            process.exit(1);
        }
        finally {
            console.log("Index Watcher running...");
        }
    });
}
exports.runIndexWatcher = runIndexWatcher;
//# sourceMappingURL=index_watcher.js.map