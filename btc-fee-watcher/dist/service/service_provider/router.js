"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertStreamPath = exports.router = void 0;
const express_1 = require("express");
const dto_1 = require("./dto");
exports.router = (0, express_1.Router)();
exports.alertStreamPath = "index";
exports.router.get("/index", dto_1.handleGetIndex);
exports.router.get("/indexHistory", dto_1.handleGetIndexHistory);
//# sourceMappingURL=router.js.map