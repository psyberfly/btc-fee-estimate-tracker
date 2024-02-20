"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dst = exports.ist = exports.global = exports.S5Times = exports.msAsMinutes = exports.minutesAsMs = exports.ONE_DAY_MS = exports.TEN_MINUTES_MS = exports.ONE_MINUTE_MS = exports.ONE_HOUR_SECONDS = void 0;
exports.ONE_HOUR_SECONDS = 60 * 60;
exports.ONE_MINUTE_MS = 60 * 1000;
exports.TEN_MINUTES_MS = 10 * 60 * 1000;
exports.ONE_DAY_MS = 24 * 60 * 60 * 1000;
function minutesAsMs(minutes) {
    return 60 * minutes * 1000;
}
exports.minutesAsMs = minutesAsMs;
function msAsMinutes(ms) {
    return ms * (1 / 10000) * (1 / 60);
}
exports.msAsMinutes = msAsMinutes;
class S5Times {
    convertUnixToGlobal(timestamp) {
        return global(timestamp);
    }
    convertUnixToIST(timestamp) {
        return ist(timestamp);
    }
    convertUnixToDST(timestamp) {
        return dst(timestamp);
    }
}
exports.S5Times = S5Times;
function global(timestamp) {
    // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    const london = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "Europe/London"
    });
    // const londonTimeTForm = new Date(london);
    const brisbane = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "Australia/Brisbane"
    });
    // const aestTimeTForm = new Date(brisbane);
    const shanghai = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "Asia/Shanghai"
    });
    // const asiaTimeTForm = new Date(kolkata);
    const vancouver = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "America/Vancouver"
    });
    // const canadaWestTimeTForm = new Date(vancouver);
    const kolkata = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });
    // const indiaTimeTForm = new Date(kolkata);
    const nyc = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "America/New_york"
    });
    // const usaTimeTForm = new Date(nyc);
    const amsterdam = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "Europe/Amsterdam"
    });
    // const netherlandsTimeTForm = new Date(amsterdam);
    const curacao = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "America/Curacao"
    });
    // const curacaoTimeTForm = new Date(curacao);
    return {
        brisbane,
        shanghai,
        nyc,
        kolkata,
        vancouver,
        amsterdam,
        curacao,
        london
    };
}
exports.global = global;
;
function ist(timestamp) {
    const indiaTime = new Date(timestamp).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
    });
    // const indiaTimeTForm = new Date(indiaTime);
    return indiaTime;
}
exports.ist = ist;
function dst(timestamp) {
    const netherlandsTime = new Date().toLocaleString("en-US", {
        timeZone: "Europe/Amsterdam"
    });
    // const netherlandsTimeTForm = new Date(netherlandsTime);
    return netherlandsTime;
}
exports.dst = dst;
//# sourceMappingURL=time.js.map