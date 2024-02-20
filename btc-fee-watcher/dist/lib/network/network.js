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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApiCall = void 0;
const axios_1 = __importDefault(require("axios"));
const e_1 = require("../errors/e");
function makeApiCall(url, method, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Make a GET request to the API endpoint
            const response = yield axios_1.default.request({
                url,
                method,
                data,
            });
            // Access the response data
            const responseData = response.data;
            return responseData;
        }
        catch (error) {
            console.error("Network Lib: Error making API call!");
            return (0, e_1.handleError)(error);
        }
    });
}
exports.makeApiCall = makeApiCall;
//# sourceMappingURL=network.js.map