import { RECAPTCHA_ENTERPRISE_SITE_KEY } from 'app/config/constants';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const loadReCaptcha = (siteKey: string) => {
  const script = document.createElement('script');
  // script.src = `strict-dynamic https://www.recaptcha.net/recaptcha/api.js?render=${siteKey} 'sha256-ThhI8UaSFEbbl6cISiZpnJ4Z44uNSq2tPKgyRTD3LyU=' unsafe-inline unsafe-eval`
  script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
  // script.nonce = goog.getScriptNonce();
  // script.setAttribute('src-elem')
  document.body.appendChild(script);
};

export default class ReCAPTCHA {
  siteKey: string;

  constructor() {
    loadReCaptcha(RECAPTCHA_ENTERPRISE_SITE_KEY);
    this.siteKey = RECAPTCHA_ENTERPRISE_SITE_KEY;
  }

  async getToken(): Promise<string> {
    let token = '';
    await window.grecaptcha.enterprise
      .execute(this.siteKey)
      .then((res: string) => {
        token = res;
      });
    return token;
  }
}
