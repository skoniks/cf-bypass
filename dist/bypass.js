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
function turnstile(page) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.route('**/*', (route) => __awaiter(this, void 0, void 0, function* () {
            const url = route.request().url();
            if (url.includes('turnstile/v0/api.js')) {
                const response = yield route.fetch();
                let text = (yield (response === null || response === void 0 ? void 0 : response.text())) || '';
                text = text.replace(';let _=t.callback', ';window.cc=t.callback;let _=t.callback');
                yield route.fulfill({
                    body: text,
                    status: 200,
                    contentType: 'text/javascript',
                });
            }
            else {
                route.continue();
            }
        }));
    });
}
function bypass(url, key, page, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        const cf = 'Checking if the site connection is secure';
        yield page.goto(url, { waitUntil: 'domcontentloaded' });
        let body = yield page.innerText('body');
        if (body.includes(cf)) {
            yield turnstile(page);
            const iframe = page.locator('iframe');
            const button = page.getByRole('button', { name: 'Verify you are human' });
            do {
                yield page.waitForLoadState('networkidle');
                if (yield button.isVisible())
                    yield button.click();
                if (yield iframe.isVisible()) {
                    const src = yield iframe.getAttribute('src');
                    const sitekey = src === null || src === void 0 ? void 0 : src.split('/').find((i) => i.match(/0x.*/));
                    if (!sitekey)
                        throw new Error('ERROR_NO_SITEKEY');
                    const result = yield (0, captcha_1.captcha)(key, sitekey, url, proxy);
                    yield page.evaluate((key) => window.cc(key), result);
                }
                yield new Promise((resolve) => setTimeout(resolve, 1000));
                body = yield page.innerText('body');
            } while (body.includes(cf));
        }
        const cookies = yield page.context().cookies();
        return { cookies };
    });
}
exports.bypass = bypass;
//# sourceMappingURL=bypass.js.map