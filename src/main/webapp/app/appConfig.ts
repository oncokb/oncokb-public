export enum AppProfile {
  PROD = 'PROD',
  DEV = 'DEV'
}

type ServerConfig = {
  appProfile: AppProfile;
  token: string;
  googleAnalyticsProjectId: string;
  sentryProjectId: string;
};

interface IAppConfig {
  serverConfig: ServerConfig;
}

export const AppConfig: IAppConfig = {
  serverConfig: (window as any).serverConfig || {}
};
