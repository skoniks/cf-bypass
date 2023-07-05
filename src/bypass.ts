import { Cookie, Page } from 'playwright';
import { captcha } from './captcha';

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

export async function bypass(
  url: string,
  key: string,
  page: Page,
  proxy?: string,
): Promise<{
  cookies: Cookie[];
}> {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'turnstile', {
      get() {
        return this._turnstile;
      },
      set(value: any) {
        value.render = (_: any, params: any) => {
          window._cf_bp_render = params;
        };
        this._turnstile = value;
      },
    });
  });
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.match(/\/turnstile\/v0(\/.*)?\/api\.js/)) {
      const response = await route.fetch();
      let text = (await response?.text()) || '';
      await route.fulfill({
        body: text.replace('"turnstile"in window', '!!window["turnstile"]'),
        contentType: 'text/javascript',
      });
    } else {
      await route.continue();
    }
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (await page.evaluate(() => window._cf_chl_opt)) {
    do {
      await page.waitForLoadState('networkidle');
      const params = await page.evaluate(() => window._cf_bp_render);
      if (params) {
        const userAgent = await page.evaluate(() => window.navigator.userAgent);
        const result = await captcha(
          key,
          {
            sitekey: params.sitekey,
            action: params.action,
            data: params.cData,
            pagedata: params.chlPageData,
            useragent: userAgent,
            pageurl: url,
          },
          proxy,
        );
        await page.evaluate(
          (key) => window._cf_bp_render?.callback(key),
          result,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (await page.evaluate(() => window._cf_chl_opt));
  }

  const cookies = await page.context().cookies();
  return { cookies };
}
