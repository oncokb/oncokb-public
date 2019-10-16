import { observable } from 'mobx';
import { remoteData } from 'cbioportal-frontend-commons';
import apiClient from 'app/shared/api/oncokbClientInstance';
import { OncoKBInfo } from 'app/shared/api/generated/OncoKbAPI';
import { MainNumber } from 'app/shared/api/generated/OncoKbPrivateAPI';
import oncokbPrivateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { DEFAULT_MAIN_NUMBERS, DEFAULT_ONCOKB_INFO } from 'app/config/constants';

export interface IAppConfig {
  ribbonEnv: string;
  inProduction: boolean;
  isSwaggerEnabled: boolean;
}

class AppStore {
  @observable ribbonEnv = '';
  @observable inProduction = true;
  @observable isSwaggerEnabled = false;

  readonly appInfo = remoteData<OncoKBInfo>({
    invoke: () => apiClient.infoGetUsingGET({}),
    default: DEFAULT_ONCOKB_INFO
  });

  readonly mainNumbers = remoteData<MainNumber>({
    await: () => [],
    async invoke() {
      return oncokbPrivateClient.utilsNumbersMainGetUsingGET({});
    },
    default: DEFAULT_MAIN_NUMBERS
  });

  constructor(props?: IAppConfig) {
    if (props) {
      this.ribbonEnv = props.ribbonEnv;
      this.inProduction = props.inProduction;
      this.isSwaggerEnabled = props.isSwaggerEnabled;
    }
  }
}

export default AppStore;
