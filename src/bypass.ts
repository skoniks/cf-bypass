import { Cookie, Page } from 'playwright';
import { captcha } from './captcha';

declare global {
  interface Window {
    cc: any;
  }
}

async function turnstile(page: Page) {
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.includes('turnstile/v0/api.js')) {
      const response = await route.fetch();
      let text = (await response?.text()) || '';
      text = text.replace(
        ';let _=t.callback',
        ';window.cc=t.callback;let _=t.callback',
      );
      await route.fulfill({
        body: text,
        status: 200,
        contentType: 'text/javascript',
      });
    } else {
      route.continue();
    }
  });
}

export async function bypass(
  url: string,
  key: string,
  page: Page,
  proxy?: string,
): Promise<{
  cookies: Cookie[];
}> {
  const cf = 'Checking if the site connection is secure';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  let body = await page.innerText('body');

  if (body.includes(cf)) {
    await turnstile(page);
    const iframe = page.locator('iframe');
    const button = page.getByRole('button', { name: 'Verify you are human' });
    do {
      await page.waitForLoadState('networkidle');
      if (await button.isVisible()) await button.click();
      if (await iframe.isVisible()) {
        const src = await iframe.getAttribute('src');
        const sitekey = src?.split('/').find((i) => i.match(/0x.*/));
        if (!sitekey) throw new Error('ERROR_NO_SITEKEY');
        const result = await captcha(key, sitekey, url, proxy);
        await page.evaluate((key) => window.cc(key), result);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      body = await page.innerText('body');
    } while (body.includes(cf));
  }

  const cookies = await page.context().cookies();
  return { cookies };
}
