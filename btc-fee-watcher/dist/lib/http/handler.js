"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.filterError = exports.checkResponseSignature = exports.getResponseSignature = exports.respond = exports.parseRequest = void 0;
/*
cypherpost.io
Developed @ Stackmate India
*/
// ------------------ '(◣ ◢)' ---------------------
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const winston_1 = require("../logger/winston");
const uid_1 = require("../uid/uid");
const e_1 = require("../errors/e");
// ------------------ '(◣ ◢)' ---------------------
const KEY_PATH = `${process.env.HOME}/.keys`;
const KEY_NAME = "sats_sig";
const s5uid = new uid_1.S5UID();
// ------------------ '(◣ ◢)' ---------------------
// try sending a request without header
function parseRequest(request) {
    const r_custom = {
        method: request.method || "method_error",
        resource: request.originalUrl || "resource_error",
        headers: request.headers || "headers_error",
        body: request.body || "body_error",
        uid: request.headers["uid"] || "private",
        files: request.files || "zil",
        file: request.file || "zil",
        timestamp: Date.now(),
        gmt: new Date(Date.now()).toUTCString(),
        ip: request.headers["x-forwarded-for"] || "ip_error",
        params: request.params || {},
        device: request.headers["user-agent"] || "unknown",
        query: request.query,
    };
    return r_custom;
}
exports.parseRequest = parseRequest;
// ------------------ '(◣ ◢)' ---------------------
function respond(status_code, message, response, request) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sats_id = s5uid.createResponseID();
            const now = Date.now();
            const headers = {
                "x-s5-id": sats_id,
                "x-s5-time": now,
            };
            // const signature = await getResponseSignature(
            //   status_code,
            //   request["resource"],
            //   request["method"],
            //   headers,
            //   message
            // );
            // if (signature instanceof Error) {
            //   return signature;
            // }
            const signature = "sampleSignature";
            const headers_with_sig = {
                "x-s5-id": sats_id,
                "x-s5-time": now,
                "x-s5-signature": signature,
            };
            // logger.info({ user: ((request.uid)?request.uid:"external"), resource: `${request['method']}-${(request["resource"] || request['originalUrl'])}`, status_code })
            return (response
                .set(headers_with_sig)
                .status(status_code)
                .send(message));
        }
        catch (e) {
            winston_1.logger.error("Ourskirts error at dto respond", e);
            let message = winston_1.r_500;
            switch (e.code) {
                case 401:
                    message = {
                        error: e.message,
                    };
                    break;
                case 400:
                    message = {
                        error: e.message,
                    };
                    break;
                case 500:
                    message = {
                        error: e.message,
                    };
                    break;
                default:
                    message = {
                        error: "Internal Signing Error",
                    };
                    e.code = 500;
                    break;
            }
            return (response.status(e.code).send(message));
        }
    });
}
exports.respond = respond;
// ------------------ '(◣ ◢)' ---------------------
function getResponseSignature(status_code, ep, method, headers, body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (fs.existsSync(`${KEY_PATH}/${KEY_NAME}.pem`)) {
                const private_key = fs
                    .readFileSync(`${KEY_PATH}/${KEY_NAME}.pem`)
                    .toString("ascii");
                const message = `${status_code}-${headers["x-s5-id"]}-${headers["x-s5-time"]}`;
                // RESPONSE WITHOUT BODY
                const sign = crypto.createSign("RSA-SHA256");
                sign.update(message);
                sign.end();
                const signature = sign.sign({ key: private_key }, "base64");
                const status = yield checkResponseSignature(status_code, headers, signature);
                if (status instanceof Error)
                    return status;
                return signature;
            }
            else {
                winston_1.logger.error("No response signing key found!. Run $ ditto crpf sats_sig");
                return (0, e_1.handleError)({
                    code: 500,
                    message: "No response signing key found!",
                });
            }
        }
        catch (e) {
            winston_1.logger.error(e);
            return (0, e_1.handleError)(e);
        }
    });
}
exports.getResponseSignature = getResponseSignature;
// ------------------ '(◣_◢)' ------------------
function checkResponseSignature(status_code, headers, sig_b64) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const signature = Buffer.from(sig_b64, "base64");
            const public_key = fs
                .readFileSync(`${KEY_PATH}/${KEY_NAME}.pub`)
                .toString("ascii");
            const message = `${status_code}-${headers["x-s5-id"]}-${headers["x-s5-time"]}`;
            const verify = crypto.createVerify("RSA-SHA256");
            verify.update(message);
            // verify.end();
            return (verify.verify(Buffer.from(public_key, "ascii"), signature));
        }
        catch (e) {
            return (0, e_1.handleError)(e);
        }
    });
}
exports.checkResponseSignature = checkResponseSignature;
// ------------------ '(◣ ◢)' ---------------------
function filterError(e, custom_500_message, request_data) {
    try {
        let code = 500;
        let message = custom_500_message;
        const s_codes = [
            "202",
            "400",
            "401",
            "402",
            "403",
            "404",
            "406",
            "409",
            "415",
            "420",
            "422",
            "429",
        ];
        const n_codes = [
            202,
            400,
            401,
            402,
            403,
            404,
            406,
            409,
            415,
            420,
            422,
            429,
        ];
        if (e instanceof Error && s_codes.includes(e.name)) {
            code = parseInt(e.name, 10);
        } // just to not break old error format
        else if (e.code && typeof (e.code) == "number") {
            code = e["code"];
        }
        // logger.warn({
        //   code,
        //   resource:request_data.resource,
        //   method: request_data.method,
        //   e: e['message'],
        //   user: (request_data.user) ? request_data.user.email : request_data.ip
        // });
        winston_1.logger.debug({ e });
        // if(code === 400) logger.debug({e})
        // important that these codes are numbers and not strings
        // node.js erorrs return strings, custom is number, ogay?
        if (n_codes.includes(code)) {
            // Client Errors: Change message from default 500
            // if (code === 400) message = { temp: "Bad body params" }
            // if (code === 401) message = { temp: "Bad authentication" }
            // if (code === 404) message = { temp: "Resource Not Available" }
            // if (code === 409) message = { temp: "Duplicate Entry" }
            // if (code === 409) message = { temp: "Duplicate Entry" }
            if (Array.isArray(e["message"]))
                message = { array: e["message"] };
            if (parseJSONSafely(e["message"])) {
                message = { error: parseJSONSafely(e["message"]) };
            }
            else
                message = { error: e["message"] };
        }
        else {
            // Server Errors: Leave message as default 500
            // request_data["headers"] = undefined;
            winston_1.logger.error({
                request: {
                    body: request_data["body"],
                    resource: request_data["resource"],
                    ip: request_data.ip || "no ip",
                },
                e,
            });
        }
        return {
            code,
            message,
        };
    }
    catch (e) {
        return {
            code: 500,
            message: custom_500_message,
        };
    }
}
exports.filterError = filterError;
function parseJSONSafely(str) {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        //
        // Return a default object, or null based on use case.
        return false;
    }
}
// ------------------ '(◣ ◢)' ---------------------
//# sourceMappingURL=handler.js.map