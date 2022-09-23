import { RECAPTCHA_SITE_KEY_V3 } from 'app/config/constants';
import { setRecaptchaToken } from 'app/indexUtils';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const loadReCaptcha = (siteKey: string) => {
  const script = document.createElement('script');
  // script.src = `strict-dynamic https://www.recaptcha.net/recaptcha/api.js?render=${siteKey} 'sha256-ThhI8UaSFEbbl6cISiZpnJ4Z44uNSq2tPKgyRTD3LyU=' unsafe-inline unsafe-eval`
  script.src = `https://www.recaptcha.net/recaptcha/api.js?render=${siteKey}`;
  // script.nonce = goog.getScriptNonce();
  // script.setAttribute('src-elem')
  document.body.appendChild(script);
};

export default class ReCAPTCHA {
  siteKey: string;
  action: string;

  constructor(action: string) {
    loadReCaptcha(RECAPTCHA_SITE_KEY_V3);
    this.siteKey = RECAPTCHA_SITE_KEY_V3;
    this.action = action;
  }

  async getToken(): Promise<string> {
    let token = '';
    await window.grecaptcha
      .execute(this.siteKey, { action: this.action })
      .then((res: string) => {
        token = res;
        setRecaptchaToken(token);
      });
    return token;
  }
}
