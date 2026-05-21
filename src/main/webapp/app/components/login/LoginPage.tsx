import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import * as QueryString from 'query-string';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import SmallPageContainer from 'app/components/SmallPageContainer';
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
  PAGE_ROUTE,
  SHOW_KEYCLOAK_TEMP_PAGE_QUERY_PARAM,
} from 'app/config/constants';
import { TrialActivationPageLink } from 'app/shared/utils/UrlUtils';
import { AppConfig } from 'app/appConfig';
import ReCAPTCHA from 'app/shared/recaptcha/recaptcha';
import { setRecaptchaToken } from 'app/indexUtils';
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
  @observable showKeycloakTempPage = false;

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

  @computed
  get normalizedEmail() {
    return this.email.trim().toLowerCase();
  }

  @computed
  get hasValidEmail() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.normalizedEmail);
  }

  @computed
  get hasEnteredPassword() {
    return this.password.trim().length > 0;
  }

  @computed
  get canSignIn() {
    return this.hasValidEmail && this.hasEnteredPassword;
  }

  @computed
  get isMskEmail() {
    return this.normalizedEmail.endsWith('@mskcc.org');
  }

  @computed
  get shouldShowKeycloakTempPage() {
    const queryStrings = QueryString.parse(this.props.routing.location.search);
    return (
      this.showKeycloakTempPage ||
      queryStrings[SHOW_KEYCLOAK_TEMP_PAGE_QUERY_PARAM] === 'true'
    );
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

  @action
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
      this.showKeycloakTempPage = true;
      return;
    }
    this.savedCredential = {
      username: normalizedEmail,
      password,
      rememberMe: false,
    };
    this.props.authenticationStore.login(normalizedEmail, password);
  };

  @action
  handleCreateAccount = () => {
    if (!this.hasValidEmail) {
      return;
    }
    this.props.routing.history.push({
      pathname: PAGE_ROUTE.REGISTER,
      search: QueryString.stringify({ email: this.normalizedEmail }),
    });
  };

  @action
  handleEmailChange = (event: any) => {
    this.email = event.target.value;
  };

  @action
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
            Your account will be created automatically
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
        disabled={!this.hasValidEmail}
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
          <Link to={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST}>
            Did you forget your password?
          </Link>
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
    if (this.shouldShowKeycloakTempPage) {
      return (
        <SmallPageContainer>
          Imagine this is the keycloak/ping login page
        </SmallPageContainer>
      );
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
