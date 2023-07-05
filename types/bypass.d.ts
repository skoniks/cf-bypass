import { Cookie, Page } from 'playwright';
declare global {
    interface Window {
        _cf_chl_opt: any;
        _cf_bp_render?: {
            callback: (key: string) => void;
            sitekey: string;
            action: string;
            cData: string;
            chlPageData: string;
        };
    }
}
export declare function bypass(url: string, key: string, page: Page, proxy?: string): Promise<{
    cookies: Cookie[];
}>;
