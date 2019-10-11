import { observable, IReactionDisposer, reaction, action, computed } from 'mobx';
import { Storage } from 'react-jhipster';
import autobind from 'autobind-decorator';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import * as _ from 'lodash';
import { assignPublicToken } from 'app/indexUtils';
import { AUTHORITIES } from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';

export const ACTION_TYPES = {
  LOGIN: 'authentication/LOGIN',
  GET_SESSION: 'authentication/GET_SESSION',
  LOGOUT: 'authentication/LOGOUT',
  CLEAR_AUTH: 'authentication/CLEAR_AUTH',
  ERROR_MESSAGE: 'authentication/ERROR_MESSAGE'
};

export const AUTH_UER_TOKEN_KEY = 'oncokb-user-token';
export const AUTH_WEBSITE_TOKEN_KEY = 'oncokb-webiste-token';

class AuthenticationStore {
  @observable rememberMe = true;
  @observable loading = false;
  @observable isAuthenticated = false;
  @observable loginSuccess = false;
  @observable loginError = false; // Errors returned from server side
  @observable loginErrorMessage = ''; // Errors returned from server side
  @observable showModalLogin = false;
  @observable errorMessage = ''; // Errors returned from server side
  @observable redirectMessage = '';
  @observable sessionHasBeenFetched = false;
  @observable idToken = '';
  @observable logoutUrl = '';

  @observable userName = '';
  @observable password = '';

  constructor() {
    const existedToken = this.getStoredToken();
    if (existedToken) {
      this.idToken = existedToken;
    }
  }

  readonly account = remoteData<UserDTO | undefined>({
    invoke: () => {
      if (this.idToken) {
        return client.getAccountUsingGET({});
      } else {
        return Promise.resolve(undefined);
      }
    },
    onResult: account => {
      if (account) {
        this.isAuthenticated = true;
      }
    },
    default: undefined
  });

  @computed
  get isUserAuthenticated() {
    return (
      this.isAuthenticated &&
      this.account.result !== undefined &&
      _.intersection([AUTHORITIES.ADMIN, AUTHORITIES.USER], this.account.result.authorities).length > 0
    );
  }

  @autobind
  @action
  public login(username: string, password: string, rememberMe = false) {
    this.loading = true;
    this.rememberMe = rememberMe;
    client
      .authorizeUsingPOST({
        loginVm: {
          username,
          password,
          rememberMe: this.rememberMe
        }
      })
      .then(this.loginSuccessCallback, this.loginErrorCallback);
  }

  @action.bound
  loginSuccessCallback(result: string) {
    const uuid = result;
    if (this.rememberMe) {
      Storage.local.set(AUTH_UER_TOKEN_KEY, uuid);
    } else {
      Storage.session.set(AUTH_UER_TOKEN_KEY, uuid);
    }
    this.idToken = uuid;
    this.loginSuccess = true;
    this.loading = false;
  }

  @action.bound
  loginErrorCallback(error: Error) {
    this.loginError = true;
    this.loginErrorMessage = error.message;
  }

  public clearAuthToken() {
    if (Storage.local.get(AUTH_UER_TOKEN_KEY)) {
      Storage.local.remove(AUTH_UER_TOKEN_KEY);
    }
    if (Storage.session.get(AUTH_UER_TOKEN_KEY)) {
      Storage.session.remove(AUTH_UER_TOKEN_KEY);
    }
  }

  public getStoredToken() {
    return Storage.local.get(AUTH_UER_TOKEN_KEY) || Storage.session.get(AUTH_UER_TOKEN_KEY) || Storage.session.get(AUTH_WEBSITE_TOKEN_KEY);
  }

  @autobind
  @action
  public logout() {
    this.clearAuthToken();
    this.idToken = '';
    this.loginSuccess = false;
    // Revert back to public website token
    assignPublicToken();
  }
}

export default AuthenticationStore;
