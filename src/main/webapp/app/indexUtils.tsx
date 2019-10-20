import { Storage } from 'react-jhipster';
import { AUTH_WEBSITE_TOKEN_KEY } from 'app/store/AuthenticationStore';

export const assignPublicToken = () => {
  // Inject the public website token to storage
  const pubWebToken = (window as any).PUB_WEB_TOKEN;
  if (pubWebToken) {
    Storage.session.set(AUTH_WEBSITE_TOKEN_KEY, pubWebToken);
  }
};

export function initializeAPIClients(){

  // we need to set the domain of our api clients


  // add POST caching
}
