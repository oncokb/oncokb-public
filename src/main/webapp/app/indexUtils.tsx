import { Storage } from 'react-jhipster';
import { AppConfig } from 'app/appConfig';
import AppStore from 'app/store/AppStore';
import App from 'app/App';
import stores from 'app/App';

export const AUTH_UER_TOKEN_KEY = 'oncokb-user-token';
export const AUTH_WEBSITE_TOKEN_KEY = 'oncokb-website-token';
export const RECAPCHA_TOKEN_KEY = 'g-recaptcha-response';

export const getPublicWebsiteToken = () => {
  return Storage.session.get(AUTH_WEBSITE_TOKEN_KEY);
};

export const setPublicWebsiteToken = (pubWebToken: string) => {
  Storage.session.set(AUTH_WEBSITE_TOKEN_KEY, pubWebToken);
};

export const getStoredToken = () => {
  return Storage.local.get(AUTH_UER_TOKEN_KEY) || getPublicWebsiteToken();
};

export const setRecaptchaToken = (recaptchaToken: string) => {
  Storage.session.set(RECAPCHA_TOKEN_KEY, recaptchaToken);
};

export const getStoredRecaptchaToken = () => {
  return Storage.session.get(RECAPCHA_TOKEN_KEY);
};

export const assignPublicToken = () => {
  // Inject the public website token to storage
  if (AppConfig.serverConfig.token) {
    setPublicWebsiteToken(AppConfig.serverConfig.token);
  }
};

export function initializeAPIClients() {
  // we need to set the domain of our api clients
  // add POST caching
}
