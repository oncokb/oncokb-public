import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import SmallPageContainer from 'app/components/SmallPageContainer';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { Alert, Col, Row } from 'react-bootstrap';
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
  TOKEN_ABOUT_2_EXPIRE_NOTICE_IN_DAYS,
} from 'app/config/constants';
import { TrialActivationPageLink } from 'app/shared/utils/UrlUtils';
import { getStoredRecaptchaToken } from 'app/indexUtils';
import ReCAPTCHA from 'app/shared/recaptcha/recaptcha';
export interface ILoginProps {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
}

@inject('authenticationStore', 'routing')
@observer
export default class LoginPage extends React.Component<ILoginProps> {
  @observable savedCredential: LoginVM;

  @observable resendingVerification = false;
  @observable resendVerificationMessage: string;

  recaptcha = new ReCAPTCHA('login');

  resentEmail = async () => {
    this.resendingVerification = true;
    const token: string = await this.recaptcha.getToken();
    client
      .resendVerificationUsingPOST({
        loginVm: this.savedCredential,
        recaptchaToken: token,
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
    this.savedCredential = {
      username: email,
      password,
      rememberMe: false,
    };
    this.props.authenticationStore.login(email, password);
  };

  render() {
    const { from } = this.props.routing.location.state || {
      from: { pathname: '/', search: location.search },
    };
    if (this.props.authenticationStore.isUserAuthenticated) {
      return <Redirect to={from} />;
    }
    return (
      <SmallPageContainer>
        <AvForm onSubmit={this.handleLogin}>
          <Row>
            <Col md="12">
              {this.props.authenticationStore.loginError ? (
                <>
                  <Alert variant={'danger'}>
                    <div>
                      {getErrorMessage(
                        this.props.authenticationStore.loginError
                      )}
                      <div>{this.trialActivationLink}</div>
                    </div>
                  </Alert>
                  {this.showResendInfo && (
                    <>
                      <Alert variant={'info'}>
                        We have emailed you a verification link. Did not receive
                        the verification email?{' '}
                        <LoadingButton
                          variant="primary"
                          size={'sm'}
                          onClick={this.resentEmail}
                          loading={this.resendingVerification}
                        >
                          <span>Resend email</span>
                        </LoadingButton>
                      </Alert>
                      {this.resendVerificationMessage && (
                        <Alert variant={'info'}>
                          {this.resendVerificationMessage}
                        </Alert>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </Col>
            <Col md="12">
              <AvField
                name="email"
                label="Email"
                placeholder="Your email address"
                type="text"
                required
                autoFocus
              />
              <AvField
                name="password"
                type="password"
                label="Password"
                placeholder="Your password"
                required
                errorMessage="Password cannot be empty"
              />
            </Col>
          </Row>
          <div className="mt-1">&nbsp;</div>
          <Alert variant="warning">
            <Link to={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST}>
              Did you forget your password?
            </Link>
          </Alert>
          <Alert variant="warning">
            <span>You don&apos;t have an account yet?</span>{' '}
            <Link to={PAGE_ROUTE.REGISTER}>Register a new account</Link>
          </Alert>
          <LoadingButton
            variant="primary"
            type="submit"
            loading={this.props.authenticationStore.loading}
          >
            <span>Log in</span>
          </LoadingButton>
        </AvForm>
      </SmallPageContainer>
    );
  }
}
