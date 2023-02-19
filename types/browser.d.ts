import { BrowserFingerprintWithHeaders } from 'fingerprint-generator';
import { Cookie, Page } from 'playwright';
export declare function newPage({ proxy, cookies, }?: {
    proxy?: string;
    cookies?: Cookie[];
}): Promise<{
    page: Page;
    fingerprint: BrowserFingerprintWithHeaders;
}>;
