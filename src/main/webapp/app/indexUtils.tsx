import { Storage } from 'react-jhipster';
import { AUTH_UER_TOKEN_KEY, AUTH_WEBSITE_TOKEN_KEY } from 'app/store/AuthenticationStore';
import { ONCOKB_APP_PUBLIC_TOKEN } from 'app/config/constants';

export const getPublicWebsiteToken = () => {
  return Storage.session.get(AUTH_WEBSITE_TOKEN_KEY);
};

export const setPublicWebsiteToken = (pubWebToken: string) => {
  Storage.session.set(AUTH_WEBSITE_TOKEN_KEY, pubWebToken);
};

export const getStoredToken = () => {
  return Storage.local.get(AUTH_UER_TOKEN_KEY) || getPublicWebsiteToken();
};

export const assignPublicToken = () => {
  // Inject the public website token to storage
  const pubWebToken = (window as any)[ONCOKB_APP_PUBLIC_TOKEN];
  if (pubWebToken) {
    setPublicWebsiteToken(pubWebToken);
  }
};

export function initializeAPIClients() {

  // we need to set the domain of our api clients


  // add POST caching
}
