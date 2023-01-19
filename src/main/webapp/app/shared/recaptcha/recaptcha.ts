import { RECAPTCHA_ENTERPRISE_SITE_KEY } from 'app/config/constants';
import { AppConfig } from 'app/appConfig';
import { notifyError } from '../utils/NotificationUtils';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const loadReCaptcha = (siteKey: string) => {
  const script = document.createElement('script');
  script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
  document.body.appendChild(script);
};

export default class ReCAPTCHA {
  siteKey: string;

  constructor() {
    this.siteKey = AppConfig.serverConfig.recaptchaSiteKey;
    loadReCaptcha(this.siteKey);
  }

  async getToken(): Promise<string> {
    let token = '';
    await window.grecaptcha.enterprise
      .execute(this.siteKey)
      .then((res: string) => {
        token = res;
      })
      .catch((error: Error) => {
        notifyError(error);
      });
    return token;
  }
}
