import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
import SmallPageContainer from 'app/components/SmallComponentContainer';
import { AvCheckbox, AvCheckboxGroup, AvField, AvForm, AvGroup, AvInput } from 'availity-reactstrap-validation';
import { Alert, Button, Col, Row } from 'react-bootstrap';

export interface ILoginProps {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
}

const LoginContent: React.FunctionComponent<{
  loginError: boolean;
  handleLogin: Function;
}> = props => {
  return (
    <SmallPageContainer>
      <AvForm onSubmit={props.handleLogin}>
        <Row>
          <Col md="12">
            {props.loginError ? (
              <Alert variant="danger">
                <strong>Failed to sign in!</strong> Please check your credentials and try again.
              </Alert>
            ) : null}
          </Col>
          <Col md="12">
            <AvField
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
              required
              errorMessage="Email is invalid"
              autoFocus
            />
            <AvField
              name="password"
              type="password"
              label="Password"
              placeholder="Your password"
              required
              errorMessage="Password cannot be empty!"
            />
            <AvCheckboxGroup name="rememberMe">
              <AvCheckbox label="Remember Me" value="rememberMe" />
            </AvCheckboxGroup>
          </Col>
        </Row>
        <div className="mt-1">&nbsp;</div>
        <Alert variant="warning">
          <Link to="/account/reset/request">Did you forget your password?</Link>
        </Alert>
        <Alert variant="warning">
          <span>You don&apos;t have an account yet?</span> <Link to="/account/register">Register a new account</Link>
        </Alert>
        <Button variant="primary" type="submit">
          Sign in
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
    { email, password, rememberMe = [] }: { email: string; password: string; rememberMe: string[] }
  ) => {
    this.props.authenticationStore.login(email, password, rememberMe.includes('rememberMe'));
  };

  render() {
    const { from } = this.props.routing.location.state || { from: { pathname: '/', search: location.search } };
    if (this.props.authenticationStore.isUserAuthenticated) {
      return <Redirect to={from} />;
    }
    return <LoginContent loginError={this.props.authenticationStore.loginError} handleLogin={this.handleLogin} />;
  }
}
