import { observable } from 'mobx';
import { Storage } from 'react-jhipster';
import autobind from 'autobind-decorator';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';

export const ACTION_TYPES = {
  LOGIN: 'authentication/LOGIN',
  GET_SESSION: 'authentication/GET_SESSION',
  LOGOUT: 'authentication/LOGOUT',
  CLEAR_AUTH: 'authentication/CLEAR_AUTH',
  ERROR_MESSAGE: 'authentication/ERROR_MESSAGE'
};

export const AUTH_TOKEN_KEY = 'oncokb-authenticationToken';

class AuthenticationStore {
  @observable rememberMe = false;
  @observable loading = false;
  @observable isAuthenticated = false;
  @observable loginSuccess = false;
  @observable loginError = false; // Errors returned from server side
  @observable showModalLogin = false;
  @observable account: UserDTO = {} as UserDTO;
  @observable errorMessage = ''; // Errors returned from server side
  @observable redirectMessage = '';
  @observable sessionHasBeenFetched = false;
  @observable idToken = '';
  @observable logoutUrl = '';

  constructor() {}

  @autobind
  public async login(username: string, password: string) {
    this.loading = true;
    const result = await client.authorizeUsingPOST({ loginVm: { username, password, rememberMe: false } });

    const jwt = result.id_token;
    if (this.rememberMe) {
      Storage.local.set(AUTH_TOKEN_KEY, jwt);
    } else {
      Storage.session.set(AUTH_TOKEN_KEY, jwt);
    }

    this.account = await client.getAccountUsingGET({});
    this.isAuthenticated = true;
    this.loginSuccess = true;
    this.loading = false;
  }

  public clearAuthToken() {
    if (Storage.local.get(AUTH_TOKEN_KEY)) {
      Storage.local.remove(AUTH_TOKEN_KEY);
    }
    if (Storage.session.get(AUTH_TOKEN_KEY)) {
      Storage.session.remove(AUTH_TOKEN_KEY);
    }
  }

  public logout() {
    this.clearAuthToken();
  }

  public clearAuthentication() {
    this.clearAuthToken();
  }
}

export default AuthenticationStore;
