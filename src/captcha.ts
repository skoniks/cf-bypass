import axios from 'axios';
import { stringify } from 'querystring';

const baseURL = 'http://rucaptcha.com';

export async function captcha(
  key: string,
  sitekey: string,
  pageurl: string,
  proxy?: string,
) {
  const id = await captchaIn(key, sitekey, pageurl, proxy);
  const result = await captchaRes(key, id);
  return result;
}

async function captchaIn(
  key: string,
  sitekey: string,
  pageurl: string,
  proxy?: string,
): Promise<string> {
  const params: Record<string, unknown> = { key, method: 'turnstile', json: 1 };
  if (proxy) {
    const [type, host] = proxy.split('://');
    params.proxy = host;
    params.proxytype = type.toUpperCase();
  }
  const { data } = await axios({
    url: baseURL + '/in.php',
    data: { ...params, sitekey, pageurl },
    method: 'post',
  });
  if (!data.status) throw new Error(data.request);
  return data.request;
}

async function captchaRes(key: string, id: string): Promise<string> {
  const params: Record<string, unknown> = { key, action: 'get', json: 1 };
  do {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const { data } = await axios(
      baseURL + '/res.php?' + stringify({ ...params, id }),
    );
    if (data.status) return data.request;
    else if (data.request !== 'CAPCHA_NOT_READY') {
      throw new Error(data.request);
    }
  } while (true);
}
