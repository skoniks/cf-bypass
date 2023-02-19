import {
  BrowserFingerprintWithHeaders,
  FingerprintGenerator,
} from 'fingerprint-generator';
import { FingerprintInjector } from 'fingerprint-injector';
import { chromium, Cookie, LaunchOptions, Page } from 'playwright';

const opsys = process.platform == 'win32' ? 'windows' : 'linux';
const injector = new FingerprintInjector();
const generator = new FingerprintGenerator({
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

export async function newPage({
  proxy,
  cookies,
}: {
  proxy?: string;
  cookies?: Cookie[];
} = {}): Promise<{
  page: Page;
  fingerprint: BrowserFingerprintWithHeaders;
}> {
  const options: LaunchOptions = { headless: false };
  if (proxy) {
    const { origin: server, username, password } = new URL(proxy);
    options.proxy = { server, username, password };
  }
  const fingerprint = generator.getFingerprint();
  const { width, height } = fingerprint.fingerprint.screen;
  const browser = await chromium.launch(options);
  const context = await browser.newContext({ screen: { width, height } });
  await injector.attachFingerprintToPlaywright(context, fingerprint);
  if (cookies) await context.addCookies(cookies);
  const page = await context.newPage();
  return { page, fingerprint };
}
