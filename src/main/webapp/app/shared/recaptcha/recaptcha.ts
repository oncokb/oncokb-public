import { AppConfig } from 'app/appConfig';
import * as Sentry from '@sentry/react';

/* eslint no-console: 0 */

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
    if (this.siteKey !== '' && this.siteKey !== null) {
      loadReCaptcha(this.siteKey);
    } else {
      console.log('Recaptcha is not enabled. Site key not added.');
    }
  }

  async getToken(): Promise<string> {
    let token = '';
    if (this.siteKey !== '' && this.siteKey !== null) {
      await window.grecaptcha.enterprise
        .execute(this.siteKey)
        .then((res: string) => {
          token = res;
        })
        .catch((error: Error) => {
          if (AppConfig.serverConfig?.sentryProjectId) {
            Sentry.captureException(error);
          }
        });
    }
    return token;
  }
}
