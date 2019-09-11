import { observable, IReactionDisposer, reaction, action, computed } from 'mobx';
import { Storage } from 'react-jhipster';
import autobind from 'autobind-decorator';
import client from 'app/shared/api/clientInstance';
import { UserDTO, UUIDToken } from 'app/shared/api/generated/API';
import { AUTHORITIES } from '../../app-backup/config/constants';
import * as _ from 'lodash';
import { assignPublicToken } from 'app/indexUtils';

export const ACTION_TYPES = {
  LOGIN: 'authentication/LOGIN',
  GET_SESSION: 'authentication/GET_SESSION',
  LOGOUT: 'authentication/LOGOUT',
  CLEAR_AUTH: 'authentication/CLEAR_AUTH',
  ERROR_MESSAGE: 'authentication/ERROR_MESSAGE'
};

export const AUTH_TOKEN_KEY = 'oncokb-authenticationToken';

class AuthenticationStore {
  @observable rememberMe = true;
  @observable loading = false;
  @observable isAuthenticated = false;
  @observable loginSuccess = false;
  @observable loginError = false; // Errors returned from server side
  @observable loginErrorMessage = ''; // Errors returned from server side
  @observable showModalLogin = false;
  @observable account: UserDTO;
  @observable errorMessage = ''; // Errors returned from server side
  @observable redirectMessage = '';
  @observable sessionHasBeenFetched = false;
  @observable idToken = '';
  @observable logoutUrl = '';

  @observable userName = '';
  @observable password = '';

  private reactionDisposers: IReactionDisposer[] = [];

  constructor() {
    this.reactionDisposers.push(reaction(() => this.idToken, () => this.getAccount(), true));
  }

  @autobind
  public async getAccount() {
    const account = await client.getAccountUsingGET({});
    if (account) {
      this.account = account;
      this.isAuthenticated = true;
    }
  }

  @computed
  get isUserAuthenticated() {
    return this.isAuthenticated && _.intersection([AUTHORITIES.ADMIN, AUTHORITIES.USER], this.account.authorities).length > 0;
  }

  @autobind
  @action
  public async login(username: string, password: string) {
    this.loading = true;
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
  loginSuccessCallback(result: UUIDToken) {
    const jwt = result.id_token;
    if (this.rememberMe) {
      Storage.local.set(AUTH_TOKEN_KEY, jwt);
    } else {
      Storage.session.set(AUTH_TOKEN_KEY, jwt);
    }
    this.idToken = jwt;
    this.loginSuccess = true;
    this.loading = false;
  }

  @action.bound
  loginErrorCallback(error: Error) {
    this.loginError = true;
    this.loginErrorMessage = error.message;
  }

  public clearAuthToken() {
    if (Storage.local.get(AUTH_TOKEN_KEY)) {
      Storage.local.remove(AUTH_TOKEN_KEY);
    }
    if (Storage.session.get(AUTH_TOKEN_KEY)) {
      Storage.session.remove(AUTH_TOKEN_KEY);
    }
    this.idToken = '';
  }

  public hasStoredToken() {
    return Storage.local.get(AUTH_TOKEN_KEY) || Storage.session.get(AUTH_TOKEN_KEY);
  }

  @autobind
  @action
  public logout() {
    this.clearAuthToken();
    this.loginSuccess = false;

    // Revert back to public website token
    assignPublicToken();
    this.getAccount().then(
      () => {
        return;
      },
      () => {
        return;
      }
    );
  }
}

export default AuthenticationStore;
