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
    if (this.siteKey != null) {
      loadReCaptcha(this.siteKey);
    } else {
      console.error('Recaptcha cannot load. Site key not added.');
    }
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
