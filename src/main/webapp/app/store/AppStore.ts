import { action, observable } from 'mobx';
import { remoteData } from 'cbioportal-frontend-commons';
import apiClient from 'app/shared/api/oncokbClientInstance';
import { OncoKBInfo } from 'app/shared/api/generated/OncoKbAPI';
import { MainNumber } from 'app/shared/api/generated/OncoKbPrivateAPI';
import oncokbPrivateClient from 'app/shared/api/oncokbPrivateClientInstance';
import {
  DEFAULT_FEEDBACK_ANNOTATION,
  DEFAULT_MAIN_NUMBERS,
  DEFAULT_ONCOKB_INFO,
} from 'app/config/constants';
import { Feedback } from 'app/components/feedback/types';
import autobind from 'autobind-decorator';
import { Location } from 'history';

export interface IAppConfig {
  ribbonEnv: string;
  inProduction: boolean;
  isSwaggerEnabled: boolean;
}

class AppStore {
  @observable ribbonEnv = '';
  @observable inProduction = true;
  @observable isSwaggerEnabled = false;
  @observable recaptchaVerified = false;
  @observable showFeedbackFormModal = false;
  @observable inFdaRecognizedContent = false;
  @observable toFdaRecognizedContent = false;
  @observable showFdaModal = false;
  @observable fdaRedirectLastLocation: Location;
  @observable feedbackAnnotation: Feedback | undefined;

  readonly appInfo = remoteData<OncoKBInfo>({
    invoke: () => apiClient.infoGetUsingGET({}),
    default: DEFAULT_ONCOKB_INFO,
  });

  readonly mainNumbers = remoteData<MainNumber>({
    await: () => [],
    async invoke() {
      return oncokbPrivateClient.utilsNumbersMainGetUsingGET({});
    },
    default: DEFAULT_MAIN_NUMBERS,
  });

  readonly fdaNumbers = remoteData<{ [key: string]: number }>({
    await: () => [],
    async invoke() {
      return await oncokbPrivateClient.utilsNumbersFdaGetUsingGET({});
    },
    default: {},
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
