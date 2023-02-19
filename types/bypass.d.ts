import { Cookie, Page } from 'playwright';
declare global {
    interface Window {
        cc: any;
    }
}
export declare function bypass(url: string, key: string, page: Page, proxy?: string): Promise<{
    cookies: Cookie[];
}>;
