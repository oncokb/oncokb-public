import { observable } from 'mobx';

export interface IAppConfig {
  ribbonEnv: string;
  inProduction: boolean;
  isSwaggerEnabled: boolean;
}

class AppStore {
  @observable ribbonEnv = '';
  @observable inProduction = true;
  @observable isSwaggerEnabled = false;

  constructor(props?: IAppConfig) {
    if (props) {
      this.ribbonEnv = props.ribbonEnv;
      this.inProduction = props.inProduction;
      this.isSwaggerEnabled = props.isSwaggerEnabled;
    }
  }
}

export default AppStore;
