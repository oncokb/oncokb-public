import {
  observable,
  action,
  computed,
  IReactionDisposer,
  reaction,
} from 'mobx';
import { Storage } from 'react-jhipster';
import autobind from 'autobind-decorator';
import client from 'app/shared/api/clientInstance';
import { Token, UserDTO } from 'app/shared/api/generated/API';
import * as _ from 'lodash';
import { TOKEN_ABOUT_2_EXPIRE_NOTICE_IN_DAYS } from 'app/config/constants';
import {
  getPublicWebsiteToken,
  getStoredToken,
  AUTH_UER_TOKEN_KEY,
} from 'app/indexUtils';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { daysDiff } from 'app/shared/utils/Utils';

export const ACTION_TYPES = {
  LOGIN: 'authentication/LOGIN',
  GET_SESSION: 'authentication/GET_SESSION',
  LOGOUT: 'authentication/LOGOUT',
  CLEAR_AUTH: 'authentication/CLEAR_AUTH',
  ERROR_MESSAGE: 'authentication/ERROR_MESSAGE',
};

export enum ACCOUNT_STATUS {
  REGULAR,
  ABOUT_2_EXPIRED,
  TRIAL_ABOUT_2_EXPIRED,
  TRIAL_EXPIRED,
  EXPIRED,
}

class AuthenticationStore {
  @observable loading = false;
  @observable loginSuccess = false;
  @observable loginError: OncoKBError | undefined; // Errors returned from server side
  @observable showModalLogin = false;
  @observable errorMessage = ''; // Errors returned from server side
  @observable redirectMessage = '';
  @observable idToken = '';
  @observable logoutUrl = '';
  @observable account: UserDTO | undefined;
  @observable tokens: Token[] = [];

  @observable userName = '';
  @observable password = '';

  readonly reactions: IReactionDisposer[] = [];

  constructor() {
    const existedToken = getStoredToken();
    if (existedToken) {
      this.idToken = existedToken;
      if (this.idToken !== getPublicWebsiteToken()) {
        this.getAccount();
      }
    }
  }

  @action
  getAccount() {
    return new Promise((resolve, reject) => {
      client
        .getAccountUsingGET({})
        .then(account => {
          this.account = account;
          this.getAccountTokens();
          resolve();
        })
        .catch(error => {
          this.updateIdToken('');
          notifyError(
            new Error(
              'There an issue fetching your account information, please send an email to contact@oncokb.org.'
            )
          );
          reject(error);
        });
    });
  }

  @autobind
  @action
  getAccountTokens() {
    return new Promise((resolve, reject) => {
      client
        .getTokensUsingGET({})
        .then(tokens => {
          this.tokens = tokens;
          resolve(tokens);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  @autobind
  @action
  generateIdToken() {
    return new Promise((resolve, reject) => {
      client
        .createTokenUsingPOST({})
        .then((token: Token) => {
          this.getAccountTokens()
            .then(() => {
              resolve(token);
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  @action
  deleteToken(token: Token) {
    return new Promise((resolve, reject) => {
      client
        .deleteTokenUsingDELETE({
          token,
        })
        .then(() => {
          if (token.token === this.idToken) {
            if (this.tokens.length > 1) {
              const match = _.find(
                this.tokens,
                (tokenItem: Token) => tokenItem.token !== this.idToken
              );
              if (match !== undefined) {
                this.updateIdToken(match.token);
              }
            }
          }
          this.getAccountTokens()
            .then((tokens: Token[]) => {
              this.tokens = tokens;
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }

  @computed
  get isAuthenticated() {
    return !!this.idToken;
  }

  @computed
  get isUserAuthenticated() {
    return this.isAuthenticated && this.account !== undefined;
  }

  @computed
  get accountStatus() {
    const tokenValid = this.tokens.filter(
      token => new Date(token.expiration).getDate() <= Date.now()
    );
    const isTrialAccount =
      this.tokens.filter(token => token.renewable).length < 1;
    if (tokenValid.length > 0) {
      const tokenAbout2Expire = this.tokens.filter(
        token =>
          daysDiff(token.expiration) <= TOKEN_ABOUT_2_EXPIRE_NOTICE_IN_DAYS
      );
      if (tokenAbout2Expire.length === tokenValid.length) {
        return isTrialAccount
          ? ACCOUNT_STATUS.TRIAL_ABOUT_2_EXPIRED
          : ACCOUNT_STATUS.ABOUT_2_EXPIRED;
      } else {
        return ACCOUNT_STATUS.REGULAR;
      }
    } else {
      return isTrialAccount
        ? ACCOUNT_STATUS.TRIAL_EXPIRED
        : ACCOUNT_STATUS.EXPIRED;
    }
  }

  @autobind
  @action
  public login(username: string, password: string) {
    this.loading = true;
    client
      .authorizeUsingPOST({
        loginVm: {
          username,
          password,
          rememberMe: false,
        },
      })
      .then(this.loginSuccessCallback, this.loginErrorCallback);
  }

  @action.bound
  loginSuccessCallback(result: string) {
    const uuid = result;
    this.updateIdToken(uuid);

    // we should fetch the account info when the user is successfully logged in.
    this.getAccount().finally(() => {
      this.loginSuccess = true;
      this.loading = false;
      this.loginError = undefined;
    });
  }

  @action
  updateIdToken(newToken: string) {
    Storage.local.set(AUTH_UER_TOKEN_KEY, newToken);
    this.idToken = newToken;
  }

  @action.bound
  loginErrorCallback(error: OncoKBError) {
    this.loginSuccess = false;
    this.loginError = error;
    this.loading = false;
  }

  public clearAuthToken() {
    if (Storage.local.get(AUTH_UER_TOKEN_KEY)) {
      Storage.local.remove(AUTH_UER_TOKEN_KEY);
    }
    if (Storage.session.get(AUTH_UER_TOKEN_KEY)) {
      Storage.session.remove(AUTH_UER_TOKEN_KEY);
    }
  }

  @autobind
  @action
  public logout() {
    // Remove user's token
    this.clearAuthToken();
    // Remove the account info as well
    this.account = undefined;
    // Revert back to public website token
    this.idToken = getPublicWebsiteToken();
  }

  destroy() {
    for (const item of this.reactions) {
      item();
    }
  }
}

export default AuthenticationStore;
