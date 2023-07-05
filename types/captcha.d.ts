export declare function captcha(key: string, params: {
    sitekey: string;
    action: string;
    data: string;
    pagedata: string;
    useragent: string;
    pageurl: string;
}, proxy?: string): Promise<string>;
