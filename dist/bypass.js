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
exports.bypass = void 0;
const captcha_1 = require("./captcha");
function bypass(url, key, page, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.addInitScript(() => {
            Object.defineProperty(window, 'turnstile', {
                get() {
                    return this._turnstile;
                },
                set(value) {
                    value.render = (_, params) => {
                        window._cf_bp_render = params;
                    };
                    this._turnstile = value;
                },
            });
        });
        yield page.route('**/*', (route) => __awaiter(this, void 0, void 0, function* () {
            const url = route.request().url();
            if (url.match(/\/turnstile\/v0(\/.*)?\/api\.js/)) {
                const response = yield route.fetch();
                let text = (yield (response === null || response === void 0 ? void 0 : response.text())) || '';
                yield route.fulfill({
                    body: text.replace('"turnstile"in window', '!!window["turnstile"]'),
                    contentType: 'text/javascript',
                });
            }
            else {
                yield route.continue();
            }
        }));
        yield page.goto(url, { waitUntil: 'domcontentloaded' });
        if (yield page.evaluate(() => window._cf_chl_opt)) {
            do {
                yield page.waitForLoadState('networkidle');
                const params = yield page.evaluate(() => window._cf_bp_render);
                if (params) {
                    const userAgent = yield page.evaluate(() => window.navigator.userAgent);
                    const result = yield (0, captcha_1.captcha)(key, {
                        sitekey: params.sitekey,
                        action: params.action,
                        data: params.cData,
                        pagedata: params.chlPageData,
                        useragent: userAgent,
                        pageurl: url,
                    }, proxy);
                    yield page.evaluate((key) => { var _a; return (_a = window._cf_bp_render) === null || _a === void 0 ? void 0 : _a.callback(key); }, result);
                }
                yield new Promise((resolve) => setTimeout(resolve, 1000));
            } while (yield page.evaluate(() => window._cf_chl_opt));
        }
        const cookies = yield page.context().cookies();
        return { cookies };
    });
}
exports.bypass = bypass;
//# sourceMappingURL=bypass.js.map