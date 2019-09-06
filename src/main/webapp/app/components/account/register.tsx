import React from 'react';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Row, Col, Alert, Button } from 'reactstrap';
import PasswordStrengthBar from 'app/shared/password/password-strength-bar';
import { observer, inject } from 'mobx-react';
import { observable, action } from 'mobx';
import autobind from 'autobind-decorator';
import { Redirect } from 'react-router-dom';
import client from 'app/shared/api/clientInstance';
import { ManagedUserVM } from 'app/shared/api/generated/API';
import AuthenticationStore from 'app/store/AuthenticationStore';

export type NewUserRequiredFields = {
  username: string;
  password: string;
  email: string;
  jobTitle?: string;
};

enum RegisterStatus {
  REGISTERED,
  NOT_SUCCESS,
  NA,
  READY_REDIRECT
}

export type IRegisterProps = {
  authenticationStore: AuthenticationStore;
  handleRegister: (newUser: NewUserRequiredFields) => void;
};

@inject('authenticationStore')
@observer
export class RegisterPage extends React.Component<IRegisterProps> {
  @observable password = '';
  @observable registerStatus: RegisterStatus = RegisterStatus.NA;

  private redirectTimeoutInSecond = 5;
  private newAccount: Partial<ManagedUserVM>;

  @autobind
  @action
  handleValidSubmit(event: any, values: any) {
    this.newAccount = {
      login: values.username,
      password: values.firstPassword,
      email: values.email,
      jobTitle: values.jobTitle
    };

    client
      .registerAccountUsingPOST({
        managedUserVm: this.newAccount as ManagedUserVM
      })
      .then(this.successToRegistered, this.failedToRegistered);
  }

  @action.bound
  redirectToAccountPage() {
    this.registerStatus = RegisterStatus.READY_REDIRECT;
  }

  @action.bound
  async successToRegistered() {
    this.registerStatus = RegisterStatus.REGISTERED;
    // TODO: figure out whether you need to have manual activation process.
    // await this.props.authenticationStore.login(this.newAccount.login!, this.newAccount.password!);
    setTimeout(this.redirectToAccountPage, this.redirectTimeoutInSecond * 1000);
  }

  @action.bound
  failedToRegistered() {
    this.registerStatus = RegisterStatus.NOT_SUCCESS;
  }

  @autobind
  updatePassword(event: any) {
    this.password = event.target.value;
  }

  render() {
    if (this.registerStatus === RegisterStatus.READY_REDIRECT) {
      return <Redirect to={'/'} />;
    }

    if (this.registerStatus === RegisterStatus.REGISTERED) {
      return (
        <div>
          <Alert color="info">
            New account has been created, the page will be redirected to your account page in {this.redirectTimeoutInSecond}s
          </Alert>
        </div>
      );
    }

    if (this.registerStatus === RegisterStatus.NOT_SUCCESS) {
      return (
        <div>
          <Alert color="danger">Something wrong happened, we were able to create an account for you.</Alert>
        </div>
      );
    }

    return (
      <div>
        <Row className="justify-content-center">
          <Col md="8">
            <h1 id="register-title">Registration</h1>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md="8">
            <AvForm id="register-form" onValidSubmit={this.handleValidSubmit}>
              <AvField
                name="username"
                label="Username"
                placeholder={'Your username'}
                validate={{
                  required: { value: true, errorMessage: 'Your username is required.' },
                  pattern: {
                    value: '^[_.@A-Za-z0-9-]*$',
                    errorMessage: 'Your username can only contain letters and digits.'
                  },
                  minLength: { value: 1, errorMessage: 'Your username is required to be at least 1 character.' },
                  maxLength: { value: 50, errorMessage: 'Your username cannot be longer than 50 characters.' }
                }}
              />
              <AvField
                name="email"
                label="Email"
                placeholder={'Your email'}
                type="email"
                validate={{
                  required: { value: true, errorMessage: 'Your email is required.' },
                  minLength: { value: 5, errorMessage: 'Your email is required to be at least 5 characters.' },
                  maxLength: { value: 254, errorMessage: 'Your email cannot be longer than 50 characters.' }
                }}
              />
              {/* Job Title */}
              <AvField
                name="jobTitle"
                label="Job Title"
                placeholder="Your job title"
                validate={{
                  required: { value: true, errorMessage: 'Required.' },
                  minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                  maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                }}
              />
              <AvField
                name="firstPassword"
                label="New password"
                placeholder={'New password'}
                type="password"
                onChange={this.updatePassword}
                validate={{
                  required: { value: true, errorMessage: 'Your password is required.' },
                  minLength: { value: 4, errorMessage: 'Your password is required to be at least 4 characters.' },
                  maxLength: { value: 50, errorMessage: 'Your password cannot be longer than 50 characters.' }
                }}
              />
              <PasswordStrengthBar password={this.password} />
              <AvField
                name="secondPassword"
                label="New password confirmation"
                placeholder="Confirm the new password"
                type="password"
                validate={{
                  required: { value: true, errorMessage: 'Your confirmation password is required.' },
                  minLength: {
                    value: 4,
                    errorMessage: 'Your confirmation password is required to be at least 4 characters.'
                  },
                  maxLength: {
                    value: 50,
                    errorMessage: 'Your confirmation password cannot be longer than 50 characters.'
                  },
                  match: { value: 'firstPassword', errorMessage: 'The password and its confirmation do not match!' }
                }}
              />
              <Button id="register-submit" color="primary" type="submit">
                Register
              </Button>
            </AvForm>
            <p>&nbsp;</p>
            <Alert color="warning">
              <span>If you want to</span>
              <a className="alert-link"> sign in</a>
              <span>
                , you can try the default accounts:
                <br />- Administrator (login="admin" and password="admin")
                <br />- User (login="user" and password="user").
              </span>
            </Alert>
          </Col>
        </Row>
      </div>
    );
  }
}
