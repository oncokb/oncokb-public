import { Storage } from 'react-jhipster';
import { AUTH_TOKEN_KEY } from 'app/store/AuthenticationStore';

export const assignPublicToken = () => {
  // Inject the public website token to storage
  const pubWebToken = (window as any).PUB_WEB_TOKEN;
  if (pubWebToken && !(Storage.local.get(AUTH_TOKEN_KEY) || Storage.session.get(AUTH_TOKEN_KEY))) {
    Storage.local.set(AUTH_TOKEN_KEY, pubWebToken);
  }
};
