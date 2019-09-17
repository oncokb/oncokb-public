import React from 'react';

import { Button, Alert, Row, Col } from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

export interface ILoginModalProps {
  loginError: boolean;
  handleLogin: Function;
}

@observer
class LoginContent extends React.Component<ILoginModalProps> {
  handleSubmit = (event: any, errors: any, { username, password }: { username: string; password: string }) => {
    const { handleLogin } = this.props;
    handleLogin(username, password);
  };

  render() {
    const { loginError } = this.props;

    return (
      <Row className="justify-content-center">
        <Col md="6">
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
              </Col>
            </Row>
            <div className="mt-1">&nbsp;</div>
            <Alert color="warning">
              <Link to="/reset/request">Did you forget your password?</Link>
            </Alert>
            <Alert color="warning">
              <span>You don't have an account yet?</span> <Link to="/register">Register a new account</Link>
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
