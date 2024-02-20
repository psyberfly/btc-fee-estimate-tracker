"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDate = exports.UTCDate = void 0;
var UTCDate;
(function (UTCDate) {
    UTCDate[UTCDate["today"] = 0] = "today";
    UTCDate[UTCDate["lastMonth"] = 1] = "lastMonth";
    UTCDate[UTCDate["lastYear"] = 2] = "lastYear";
})(UTCDate || (exports.UTCDate = UTCDate = {}));
function fetchDate(reqDate) {
    const today = new Date();
    switch (reqDate) {
        case UTCDate.today:
            return new Date().toUTCString();
        case UTCDate.lastMonth:
            const lastMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, today.getUTCDate()));
            return lastMonth.toUTCString();
        case UTCDate.lastYear:
            const lastYear = new Date(Date.UTC(today.getUTCFullYear() - 1, today.getUTCMonth(), today.getUTCDate()));
            return lastYear.toUTCString();
        default:
            throw (Error("Unknown UTCDate argument"));
    }
}
exports.fetchDate = fetchDate;
//# sourceMappingURL=date.js.map