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
exports.newPage = void 0;
const fingerprint_generator_1 = require("fingerprint-generator");
const fingerprint_injector_1 = require("fingerprint-injector");
const playwright_1 = require("playwright");
const opsys = process.platform == 'win32' ? 'windows' : 'linux';
const injector = new fingerprint_injector_1.FingerprintInjector();
const generator = new fingerprint_generator_1.FingerprintGenerator({
    locales: ['en'],
    devices: ['desktop'],
    browsers: ['chrome'],
    operatingSystems: [opsys],
    screen: {
        minWidth: 1280,
        maxWidth: 1920,
        minHeight: 720,
        maxHeight: 1080,
    },
});
function newPage({ proxy, cookies, } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = { headless: false };
        if (proxy) {
            const { origin: server, username, password } = new URL(proxy);
            options.proxy = { server, username, password };
        }
        const fingerprint = generator.getFingerprint();
        const { width, height } = fingerprint.fingerprint.screen;
        const browser = yield playwright_1.chromium.launch(options);
        const context = yield browser.newContext({ screen: { width, height } });
        yield injector.attachFingerprintToPlaywright(context, fingerprint);
        if (cookies)
            yield context.addCookies(cookies);
        const page = yield context.newPage();
        return { page, fingerprint };
    });
}
exports.newPage = newPage;
//# sourceMappingURL=browser.js.map