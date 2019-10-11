import React from 'react';

import { Button, Alert, Row, Col, Label } from 'reactstrap';
import { AvForm, AvField, AvGroup, AvInput } from 'availity-reactstrap-validation';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

export interface ILoginModalProps {
  loginError: boolean;
  handleLogin: Function;
}

@observer
class LoginContent extends React.Component<ILoginModalProps> {
  handleSubmit = (event: any, errors: any, { username, password, rememberMe = false }: { username: string; password: string, rememberMe: boolean }) => {
    const { handleLogin } = this.props;
    handleLogin(username, password, rememberMe);
  };

  render() {
    const { loginError } = this.props;

    return (
      <Row className="justify-content-center">
        <Col lg="6">
          <AvForm onSubmit={this.handleSubmit}>
            <Row>
              <Col md="12">
                {loginError ? (
                  <Alert color="danger">
                    <strong>Failed to sign in!</strong> Please check your credentials and try again.
                  </Alert>
                ) : null}
              </Col>
              <Col md="12">
                <AvField
                  name="username"
                  label="Username"
                  placeholder="Your username"
                  required
                  errorMessage="Username cannot be empty!"
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
                <AvGroup check>
                  <Label check>
                    <AvInput type="checkbox" name="rememberMe" /> Remember Me
                  </Label>
                </AvGroup>
              </Col>
            </Row>
            <div className="mt-1">&nbsp;</div>
            <Alert color="warning">
              <Link to="/account/reset/request">Did you forget your password?</Link>
            </Alert>
            <Alert color="warning">
              <span>You don&apos;t have an account yet?</span> <Link to="/account/register">Register a new
              account</Link>
            </Alert>
            <Button color="primary" type="submit">
              Sign in
            </Button>
          </AvForm>
        </Col>
      </Row>
    );
  }
}

export default LoginContent;
