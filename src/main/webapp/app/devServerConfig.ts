const DEFAULT_DEV_PUBLIC_TOKEN = '585ee112-1ecb-47a1-b29e-7eac70e1f442';

const existingServerConfig = (window as any).serverConfig || {};
const localStorageToken =
  typeof localStorage !== 'undefined' ? localStorage.pubWebToken : undefined;

Object.assign(existingServerConfig, {
  appProfile: 'DEV',
  readonly: false,
  enableAuth: true,
  paywallEnabled: false,
  recaptchaProjectId: '',
  recaptchaSiteKey: '',
  recaptchaThreshold: 0.1,
  token: localStorageToken || DEFAULT_DEV_PUBLIC_TOKEN,
});

(window as any).serverConfig = existingServerConfig;
