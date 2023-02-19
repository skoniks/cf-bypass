# @sknx/cf-bypass

Cloudflare turnstile bypass based on playwrignt headed browser and rucaptcha.

Api key required for work can be obtained from here https://rucaptcha.com/

Running headed: https://playwright.dev/docs/ci#running-headed

# Usage

```javascript
import { bypass, newPage } from '@sknx/cf-bypass';

const url = 'https://site.com';
const key = 'rucaptcha_api_token';
const proxy = 'http://user:name@127.0.0.1:1234';
// const proxy = 'socks://user:name@127.0.0.1:1234';

try {
  const { page, fingerprint } = await newPage({ proxy });
  const { cookies } = await bypass(url, key, page, proxy);
  await page.context().close();
  console.log(cookies, fingerprint);
} catch (error) {
  console.log(error);
}
```
