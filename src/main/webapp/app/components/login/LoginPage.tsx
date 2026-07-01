import React from 'react';
import { Redirect } from 'react-router-dom';
import * as QueryString from 'query-string';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import SmallPageContainer from 'app/components/SmallPageContainer';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import {
  Alert,
  Button,
  Col,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import { LoadingButton } from 'app/shared/button/LoadingButton';
import {
  UNAUTHORIZED_EXPIRED,
  UNAUTHORIZED_LICENSE_AGREEMENT_NOT_ACCEPTED,
  UNAUTHORIZED_NOT_ACTIVATED_ENDS_WITH,
} from 'app/shared/api/errorMessages';
import { getErrorMessage } from 'app/shared/alert/ErrorAlertUtils';
import client from 'app/shared/api/clientInstance';
import { LoginVM } from 'app/shared/api/generated/API';
import {
  KEYCLOAK_ERROR_QUERY_PARAM,
  KEYCLOAK_IDP_HINT_QUERY_PARAM,
  KEYCLOAK_LOGIN_SUCCESS_QUERY_PARAM,
  MSK_PING_IDP_ALIAS,
  PAGE_ROUTE,
} from 'app/config/constants';
import { TrialActivationPageLink } from 'app/shared/utils/UrlUtils';
import { AppConfig } from 'app/appConfig';
import ReCAPTCHA from 'app/shared/recaptcha/recaptcha';
import { setRecaptchaToken } from 'app/indexUtils';
import { COLOR_BLUE } from 'app/config/theme';

const MSK_SSO_AUTHORIZATION_URL = `/oauth2/authorization/oidc?${KEYCLOAK_IDP_HINT_QUERY_PARAM}=${MSK_PING_IDP_ALIAS}`;

export interface ILoginProps {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
}

@inject('authenticationStore', 'routing')
@observer
export default class LoginPage extends React.Component<ILoginProps> {
  @observable savedCredential: LoginVM;
  @observable email = '';
  @observable password = '';
  @observable showOAuthLoginLoadingState = false;
  @observable keycloakErrorMessage: string | undefined;

  @observable resendingVerification = false;
  @observable resendVerificationMessage: string;

  recaptcha = new ReCAPTCHA();

  resendEmail = async () => {
    this.resendingVerification = true;
    const token: string = await this.recaptcha.getToken();
    setRecaptchaToken(token);
    client
      .resendVerificationUsingPOST({
        loginVm: this.savedCredential,
      })
      .then(
        () => {
          this.resendVerificationMessage = 'Email sent';
        },
        error => {
          this.resendVerificationMessage = `There is an error: ${error.message}`;
        }
      )
      .finally(() => {
        this.resendingVerification = false;
      });
  };

  @computed get showResendInfo() {
    if (this.props.authenticationStore.loginError) {
      const errorMessage = getErrorMessage(
        this.props.authenticationStore.loginError
      );
      return [
        UNAUTHORIZED_NOT_ACTIVATED_ENDS_WITH,
        UNAUTHORIZED_EXPIRED,
      ].some(str => errorMessage.endsWith(str));
    } else {
      return false;
    }
  }

  get normalizedEmail() {
    return this.email.trim().toLowerCase();
  }

  @computed
  get hasValidEmail() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.normalizedEmail);
  }

  get hasEnteredPassword() {
    return this.password.trim().length > 0;
  }

  get canSignIn() {
    return this.hasValidEmail && this.hasEnteredPassword;
  }

  get isMskEmail() {
    return this.normalizedEmail.endsWith('@mskcc.org');
  }

  @computed
  get shouldShowOAuthLoginLoadingState() {
    const queryStrings = QueryString.parse(this.props.routing.location.search);
    const isOAuthCallback =
      queryStrings[KEYCLOAK_LOGIN_SUCCESS_QUERY_PARAM] === 'true';

    if (this.props.authenticationStore.loginError) {
      return false;
    }

    if (isOAuthCallback) {
      return true;
    }

    if (!this.showOAuthLoginLoadingState) {
      return false;
    }

    return this.props.authenticationStore.loading;
  }

  componentDidMount() {
    const queryStrings = QueryString.parse(this.props.routing.location.search);
    const keycloakLoginSuccess =
      queryStrings[KEYCLOAK_LOGIN_SUCCESS_QUERY_PARAM] === 'true';
    const keycloakError = this.getQueryStringValue(
      queryStrings[KEYCLOAK_ERROR_QUERY_PARAM]
    );

    if (keycloakLoginSuccess || keycloakError) {
      this.props.routing.history.replace({ pathname: PAGE_ROUTE.LOGIN });
    }

    if (keycloakLoginSuccess) {
      this.showOAuthLoginLoadingState = true;
      this.props.authenticationStore.authenticateKeycloakLogin();
    } else if (keycloakError) {
      this.keycloakErrorMessage = keycloakError;
    }
  }

  getQueryStringValue(value: string | string[] | null | undefined) {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  @computed
  get trialActivationLink() {
    if (this.props.authenticationStore.loginError) {
      const errorMessage = getErrorMessage(
        this.props.authenticationStore.loginError
      );
      if (errorMessage.endsWith(UNAUTHORIZED_LICENSE_AGREEMENT_NOT_ACCEPTED)) {
        const trialActivationKey = this.props.authenticationStore.loginError
          .response?.body.trialActivationKey;
        if (trialActivationKey) {
          return (
            <TrialActivationPageLink
              trialActivationKey={trialActivationKey}
              onRedirect={() =>
                (this.props.authenticationStore.loginError = undefined)
              }
            />
          );
        }
      }
    }
    return null;
  }

  @action.bound
  handleLogin = (
    event: any,
    errors: any,
    { email, password }: { email: string; password: string }
  ) => {
    if (errors?.length) {
      return;
    }
    const normalizedEmail = (email || this.email).trim().toLowerCase();
    this.email = normalizedEmail;
    if (normalizedEmail.endsWith('@mskcc.org')) {
      window.location.href = MSK_SSO_AUTHORIZATION_URL;
      return;
    }
    this.savedCredential = {
      username: normalizedEmail,
      password,
      rememberMe: false,
    };
    this.props.authenticationStore.login(normalizedEmail, password);
  };

  @action.bound
  handleCreateAccount = () => {
    if (!this.hasValidEmail) {
      return;
    }
    this.props.routing.history.push({
      pathname: PAGE_ROUTE.REGISTER,
      search: QueryString.stringify({ email: this.normalizedEmail }),
    });
  };

  @action.bound
  handleForgotPassword = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    this.props.routing.history.push(PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST);
  };

  @action.bound
  handleEmailChange = (event: any) => {
    this.email = event.target.value;
  };

  @action.bound
  handlePasswordChange = (event: any) => {
    this.password = event.target.value;
  };

  renderLockedAccountMessage() {
    return (
      <div>
        <p>
          <b>Your account is temporarily locked</b>
        </p>
        <p>
          For your security, your account has been locked due to inactivity.
        </p>

        <p>
          We’ve sent an activation email from{' '}
          <a href="mailto:registration@oncokb.org">registration@oncokb.org</a>{' '}
          to your inbox with a link to unlock your account. Please check your
          email and follow the instructions to regain access.
        </p>
      </div>
    );
  }

  renderOAuthLoginLoadingState() {
    return (
      <SmallPageContainer>
        <div className="text-center py-4">
          <LoadingIndicator
            isLoading
            size={LoaderSize.LARGE}
            color={COLOR_BLUE}
            className="mb-4"
          />
          <h2 className="mb-3">Signing you in</h2>
          <p className="text-muted mb-0">
            We&apos;re finishing your MSK SSO login and loading your account.
          </p>
        </div>
      </SmallPageContainer>
    );
  }

  renderResendVerificationInfo() {
    if (!this.showResendInfo) {
      return null;
    }
    return (
      <>
        <Alert variant={'info'}>
          Did not receive the verification email?{' '}
          <LoadingButton
            variant="primary"
            size={'sm'}
            onClick={this.resendEmail}
            loading={this.resendingVerification}
          >
            <span>Resend email</span>
          </LoadingButton>
        </Alert>
        {this.resendVerificationMessage && (
          <Alert variant={'info'}>{this.resendVerificationMessage}</Alert>
        )}
      </>
    );
  }

  renderLoginError(errorMessage: string) {
    if (this.keycloakErrorMessage) {
      return <Alert variant={'danger'}>{this.keycloakErrorMessage}</Alert>;
    }

    if (!this.props.authenticationStore.loginError) {
      return null;
    }
    return (
      <>
        <Alert variant={'danger'}>
          <div>
            {errorMessage === UNAUTHORIZED_EXPIRED
              ? this.renderLockedAccountMessage()
              : errorMessage}
            <div>{this.trialActivationLink}</div>
          </div>
        </Alert>
        {this.renderResendVerificationInfo()}
      </>
    );
  }

  renderMskLogin() {
    if (!this.isMskEmail) {
      return null;
    }
    return (
      <>
        <Button
          block
          variant="outline-primary"
          type="submit"
          className="mb-2 font-medium"
        >
          Continue with MSK SSO
          <i className="fa fa-arrow-right ml-2" aria-hidden="true" />
        </Button>
        <p className="small text-center">
          New MSK user?{' '}
          <span className="font-weight-bold">
            Your OncoKB account will be created automatically after MSK sign-in
          </span>
        </p>
      </>
    );
  }

  renderPasswordField() {
    if (this.isMskEmail) {
      return null;
    }
    return (
      <AvField
        name="password"
        type="password"
        label="Password"
        placeholder="Your password"
        value={this.password}
        onChange={this.handlePasswordChange}
        autoComplete="current-password"
        required
        errorMessage="Password cannot be empty"
      />
    );
  }

  renderPasswordLoginActions() {
    if (this.isMskEmail) {
      return null;
    }
    const disabledSignInTooltip = this.hasValidEmail
      ? 'Enter your password first.'
      : 'Enter a valid email first.';
    const disabledCreateAccountTooltip = 'Enter a valid email first.';

    return (
      <>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="sign-in-disabled-tooltip">
              {disabledSignInTooltip}
            </Tooltip>
          }
          trigger={this.canSignIn ? [] : ['hover', 'focus']}
        >
          <span style={{ display: 'block' }}>
            <LoadingButton
              block
              variant="primary"
              type="submit"
              className="font-medium"
              loading={this.props.authenticationStore.loading}
              disabled={!this.canSignIn}
              style={this.canSignIn ? {} : { pointerEvents: 'none' }}
            >
              <span>
                Sign in
                <i className="fa fa-arrow-right ml-2" aria-hidden="true" />
              </span>
            </LoadingButton>
          </span>
        </OverlayTrigger>
        <div className="mt-2">
          <a
            href={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST}
            className="btn btn-link p-0 align-baseline"
            onMouseDown={this.handleForgotPassword}
          >
            Did you forget your password?
          </a>
        </div>
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="px-2 text-muted">New user?</span>
          <hr className="flex-grow-1" />
        </div>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="create-account-disabled-tooltip">
              {disabledCreateAccountTooltip}
            </Tooltip>
          }
          trigger={this.hasValidEmail ? [] : ['hover', 'focus']}
        >
          <span style={{ display: 'block' }}>
            <Button
              block
              variant="outline-primary"
              type="button"
              className="font-medium"
              onClick={this.handleCreateAccount}
              disabled={!this.hasValidEmail}
              style={this.hasValidEmail ? {} : { pointerEvents: 'none' }}
            >
              <i className="fa fa-user-plus mr-2" aria-hidden="true" />
              Create an account
            </Button>
          </span>
        </OverlayTrigger>
      </>
    );
  }

  render() {
    const { from } = this.props.routing.location.state || {
      from: { pathname: '/', search: location.search },
    };
    if (
      !AppConfig.serverConfig.enableAuth ||
      this.props.authenticationStore.isUserAuthenticated
    ) {
      return <Redirect to={from} />;
    }
    const errorMessage = getErrorMessage(
      this.props.authenticationStore.loginError ?? new Error()
    );
    if (this.shouldShowOAuthLoginLoadingState) {
      return this.renderOAuthLoginLoadingState();
    }
    return (
      <SmallPageContainer>
        <AvForm onSubmit={this.handleLogin}>
          <Row>
            <Col md="12" className="mb-2">
              <h2>Welcome</h2>
            </Col>
            <Col md="12">{this.renderLoginError(errorMessage)}</Col>
            <Col md="12">
              <AvField
                name="email"
                label="Email"
                placeholder="Your institutional email address"
                type="email"
                value={this.email}
                onChange={this.handleEmailChange}
                required
                autoComplete="username"
                autoFocus
              />
              {this.renderMskLogin()}
              {this.renderPasswordField()}
            </Col>
          </Row>
          {this.renderPasswordLoginActions()}
        </AvForm>
      </SmallPageContainer>
    );
  }
}
