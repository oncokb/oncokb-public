import { combineReducers } from 'redux';
import { loadingBarReducer as loadingBar } from 'react-redux-loading-bar';

import authentication, { AuthenticationState } from './authentication';
import applicationProfile, { ApplicationProfileState } from './application-profile';

import administration, { AdministrationState } from 'app-backup/modules/administration/administration.reducer';
import userManagement, { UserManagementState } from 'app-backup/modules/administration/user-management/user-management.reducer';
import register, { RegisterState } from 'app-backup/modules/account/register/register.reducer';
import activate, { ActivateState } from 'app-backup/modules/account/activate/activate.reducer';
import password, { PasswordState } from 'app-backup/modules/account/password/password.reducer';
import settings, { SettingsState } from 'app-backup/modules/account/settings/settings.reducer';
import passwordReset, { PasswordResetState } from 'app-backup/modules/account/password-reset/password-reset.reducer';
// prettier-ignore
import token, {
  TokenState
} from 'app-backup/entities/token/token.reducer';
// prettier-ignore
import tokenStats, {
  TokenStatsState
} from 'app-backup/entities/token-stats/token-stats.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

export interface IRootState {
  readonly authentication: AuthenticationState;
  readonly applicationProfile: ApplicationProfileState;
  readonly administration: AdministrationState;
  readonly userManagement: UserManagementState;
  readonly register: RegisterState;
  readonly activate: ActivateState;
  readonly passwordReset: PasswordResetState;
  readonly password: PasswordState;
  readonly settings: SettingsState;
  readonly token: TokenState;
  readonly tokenStats: TokenStatsState;
  /* jhipster-needle-add-reducer-type - JHipster will add reducer type here */
  readonly loadingBar: any;
}

const rootReducer = combineReducers<IRootState>({
  authentication,
  applicationProfile,
  administration,
  userManagement,
  register,
  activate,
  passwordReset,
  password,
  settings,
  token,
  tokenStats,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
  loadingBar
});

export default rootReducer;
