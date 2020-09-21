import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import AuthenticationStore, {
  ACCOUNT_STATUS
} from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import SmallPageContainer from 'app/components/SmallPageContainer';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { Alert, Col, Row } from 'react-bootstrap';
import { LoadingButton } from 'app/shared/button/LoadingButton';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import {
  UNAUTHORIZED_EXPIRED,
  UNAUTHORIZED_NOT_ACTIVATED_ENDS_WITH
} from 'app/shared/api/errorMessages';
import { getErrorMessage } from 'app/shared/alert/ErrorAlertUtils';
import client from 'app/shared/api/clientInstance';
import { LoginVM } from 'app/shared/api/generated/API';

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

  resentEmail = () => {
    this.resendingVerification = true;
    client
      .resendVerificationUsingPOST({
        loginVm: this.savedCredential
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
        UNAUTHORIZED_EXPIRED
      ].some(str => errorMessage.endsWith(str));
    } else {
      return false;
    }
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
      rememberMe: false
    };
    this.props.authenticationStore.login(email, password);
  };

  render() {
    const { from } = this.props.routing.location.state || {
      from: { pathname: '/', search: location.search }
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
                  <ErrorAlert
                    error={this.props.authenticationStore.loginError}
                  />
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
            <Link to="/account/reset/request">
              Did you forget your password?
            </Link>
          </Alert>
          <Alert variant="warning">
            <span>You don&apos;t have an account yet?</span>{' '}
            <Link to="/account/register">Register a new account</Link>
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
