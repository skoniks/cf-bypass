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
exports.captcha = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = require("querystring");
const baseURL = 'http://rucaptcha.com';
function captcha(key, params, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield captchaIn(key, params, proxy);
        const result = yield captchaRes(key, id);
        return result;
    });
}
exports.captcha = captcha;
function captchaIn(key, params, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaults = {
            key,
            method: 'turnstile',
            json: 1,
        };
        if (proxy) {
            const [type, host] = proxy.split('://');
            defaults.proxytype = type.toUpperCase();
            defaults.proxy = host;
        }
        const { data } = yield (0, axios_1.default)({
            url: baseURL + '/in.php',
            data: Object.assign(Object.assign({}, params), defaults),
            method: 'post',
        });
        if (!data.status)
            throw new Error(data.request);
        return data.request;
    });
}
function captchaRes(key, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaults = { key, action: 'get', json: 1 };
        do {
            yield new Promise((resolve) => setTimeout(resolve, 5000));
            const { data } = yield (0, axios_1.default)(baseURL + '/res.php?' + (0, querystring_1.stringify)(Object.assign(Object.assign({}, defaults), { id })));
            if (data.status) {
                return data.request;
            }
            else if (data.request !== 'CAPCHA_NOT_READY') {
                throw new Error(data.request);
            }
        } while (true);
    });
}
//# sourceMappingURL=captcha.js.map