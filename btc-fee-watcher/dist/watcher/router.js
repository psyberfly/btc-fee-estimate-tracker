"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const dto_1 = require("./dto");
exports.router = (0, express_1.Router)();
exports.router.get("/feeRatio", dto_1.handleGetFeeRatio);
//# sourceMappingURL=router.js.map