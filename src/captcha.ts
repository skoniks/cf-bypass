import axios from 'axios';
import { stringify } from 'querystring';

const baseURL = 'http://rucaptcha.com';

export async function captcha(
  key: string,
  params: {
    sitekey: string;
    action: string;
    data: string;
    pagedata: string;
    useragent: string;
    pageurl: string;
  },
  proxy?: string,
) {
  const id = await captchaIn(key, params, proxy);
  const result = await captchaRes(key, id);
  return result;
}

async function captchaIn(
  key: string,
  params: {
    sitekey: string;
    action: string;
    data: string;
    pagedata: string;
    useragent: string;
    pageurl: string;
  },
  proxy?: string,
): Promise<string> {
  const defaults: Record<string, unknown> = {
    key,
    method: 'turnstile',
    json: 1,
  };
  if (proxy) {
    const [type, host] = proxy.split('://');
    defaults.proxytype = type.toUpperCase();
    defaults.proxy = host;
  }
  const { data } = await axios({
    url: baseURL + '/in.php',
    data: { ...params, ...defaults },
    method: 'post',
  });
  if (!data.status) throw new Error(data.request);
  return data.request;
}

async function captchaRes(key: string, id: string): Promise<string> {
  const defaults: Record<string, unknown> = { key, action: 'get', json: 1 };
  do {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const { data } = await axios(
      baseURL + '/res.php?' + stringify({ ...defaults, id }),
    );
    if (data.status) {
      return data.request;
    } else if (data.request !== 'CAPCHA_NOT_READY') {
      throw new Error(data.request);
    }
  } while (true);
}
