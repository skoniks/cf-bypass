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
const _1 = require(".");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = 'https://site.com';
        const key = 'rucaptcha_api_token';
        const proxy = 'http://user:name@127.0.0.1:1234';
        // const proxy = 'socks://user:name@127.0.0.1:1234';
        try {
            const { page, fingerprint } = yield (0, _1.newPage)({ proxy });
            const { cookies } = yield (0, _1.bypass)(url, key, page, proxy);
            yield page.context().close();
            console.log(cookies, fingerprint);
        }
        catch (error) {
            console.log(error);
        }
        process.exit(0);
    });
}
bootstrap();
//# sourceMappingURL=test.js.map