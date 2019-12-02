import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import SmallPageContainer from 'app/components/SmallPageContainer';
import {
  AvCheckbox,
  AvCheckboxGroup,
  AvField,
  AvForm,
  AvGroup,
  AvInput
} from 'availity-reactstrap-validation';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';

export interface ILoginProps {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
}

const LoginContent: React.FunctionComponent<{
  loginError: boolean;
  loading: boolean;
  handleLogin: Function;
}> = props => {
  return (
    <SmallPageContainer>
      <AvForm onSubmit={props.handleLogin}>
        <Row>
          <Col md="12">
            {props.loginError ? (
              <Alert variant="danger">
                <strong>Failed to log in!</strong> Please check your credentials
                and try again.
              </Alert>
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
          <Link to="/account/reset/request">Did you forget your password?</Link>
        </Alert>
        <Alert variant="warning">
          <span>You don&apos;t have an account yet?</span>{' '}
          <Link to="/account/register">Register a new account</Link>
        </Alert>
        <Button variant="primary" type="submit" disabled={props.loading}>
          {props.loading ? (
            <LoadingIndicator isLoading={true} size={'small'} color="white" />
          ) : (
            <span>Log in</span>
          )}
        </Button>
      </AvForm>
    </SmallPageContainer>
  );
};

@inject('authenticationStore', 'routing')
@observer
export default class LoginPage extends React.Component<ILoginProps> {
  @action
  handleLogin = (
    event: any,
    errors: any,
    { email, password }: { email: string; password: string }
  ) => {
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
      <LoginContent
        loading={this.props.authenticationStore.loading}
        loginError={this.props.authenticationStore.loginError}
        handleLogin={this.handleLogin}
      />
    );
  }
}
