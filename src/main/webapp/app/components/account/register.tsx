import React from 'react';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { Alert, Button, Col, Row } from 'reactstrap';
import PasswordStrengthBar from 'app/shared/password/password-strength-bar';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import autobind from 'autobind-decorator';
import { Redirect, Link } from 'react-router-dom';
import client from 'app/shared/api/clientInstance';
import { ManagedUserVM } from 'app/shared/api/generated/API';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { LicenseSelection, LicenseType } from 'app/components/licenseSelection/LicenseSelection';
import { PAGE_ROUTE } from 'app/config/constants';

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
  @observable selectedLicense: LicenseType;

  private redirectTimeoutInSecond = 5;
  private newAccount: Partial<ManagedUserVM>;
  private sectionClassName = 'justify-content-center border-top py-3';

  @autobind
  @action
  handleValidSubmit(event: any, values: any) {
    this.newAccount = {
      login: values.username,
      password: values.firstPassword,
      email: values.email,
      jobTitle: values.jobTitle,
      company: values.company,
      city: values.city,
      country: values.country,
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
  successToRegistered() {
    this.registerStatus = RegisterStatus.REGISTERED;
    // TODO: figure out whether you need to have manual activation process.
    // await this.props.authenticationStore.login(this.newAccount.login!, this.newAccount.password!);
    setTimeout(this.redirectToAccountPage, this.redirectTimeoutInSecond * 1000);
  }

  @action.bound
  failedToRegistered() {
    this.registerStatus = RegisterStatus.NOT_SUCCESS;
  }

  getLicenseAdditionalInfo(licenseType: LicenseType) {
    if (licenseType === LicenseType.ACADEMIC) {
      return <div>OncoKB data is freely accessible for research use in the academic setting. Please register below for
        access.</div>;
    } else {
      return (
        <div>
          <div>To support the future development and maintenance of OncoKB, we have introduced license fees for clinical
            and commercial use. The fee will depend on the type of use and size of company.</div>
          <div className='mt-2'>In order to be granted access to downloadable content and our API, your company will need a license. If
            your company already has one, we will grant you access. Otherwise, we will contact you to discuss your needs
            and license terms. Please see the <Link to={PAGE_ROUTE.TERMS}>OncoKB Terms of Use</Link>.</div>
        </div>
      );
    }
  }

  @autobind
  @action
  onSelectLicense(license: LicenseType) {
    this.selectedLicense = license;
  }

  @autobind
  updatePassword(event: any) {
    this.password = event.target.value;
  }

  render() {
    if (this.registerStatus === RegisterStatus.READY_REDIRECT) {
      return <Redirect to={'/'}/>;
    }

    if (this.registerStatus === RegisterStatus.REGISTERED) {
      return (
        <div>
          <Alert color="info">
            New account has been created, the page will be redirected to your account page
            in {this.redirectTimeoutInSecond}s
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
      <Row className="justify-content-center">
        <Col lg={9}>
          <h1 id="register-title">Registration</h1>
          <AvForm id="register-form" onValidSubmit={this.handleValidSubmit}>
            <Row className={this.sectionClassName}>
              <Col md='3'>
                <h5>License</h5>
              </Col>
              <Col md="9">
                <LicenseSelection onSelectLicense={this.onSelectLicense}/>
              </Col>
            </Row>
            {this.selectedLicense ? (
              <>
                <Row className={this.sectionClassName}>
                  <Col md="9" className={'ml-auto'}>
                    {this.getLicenseAdditionalInfo(this.selectedLicense)}
                  </Col>
                </Row>
                <Row className={this.sectionClassName}>
                  <Col md='3'>
                    <h5>Account</h5>
                  </Col>
                  <Col md="9">
                    <AvField
                      name="username"
                      label="Username"
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
                      label={`${this.selectedLicense === LicenseType.ACADEMIC ? 'Institution' : 'Company'} email`}
                      type="email"
                      validate={{
                        required: { value: true, errorMessage: 'Your email is required.' },
                        minLength: { value: 5, errorMessage: 'Your email is required to be at least 5 characters.' },
                        maxLength: { value: 254, errorMessage: 'Your email cannot be longer than 50 characters.' }
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
                    <PasswordStrengthBar password={this.password}/>
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
                        match: {
                          value: 'firstPassword',
                          errorMessage: 'The password and its confirmation do not match!'
                        }
                      }}
                    />
                  </Col>
                </Row>
                <Row className={this.sectionClassName}>
                  <Col md='3'>
                    <h5>Company</h5>
                  </Col>
                  <Col md="9">
                    {/* Job Title */}
                    <AvField
                      name="jobTitle"
                      label="Position"
                      validate={{
                        required: { value: true, errorMessage: 'Required.' },
                        minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                        maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                      }}
                    />
                    {/* Company */}
                    <AvField
                      name="company"
                      label={`${this.selectedLicense === LicenseType.ACADEMIC ? 'Institution / University' : 'Company'}`}
                      validate={{
                        required: { value: true, errorMessage: 'Required.' },
                        minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                        maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                      }}
                    />
                    {/* City */}
                    <AvField
                      name="city"
                      label="City"
                      validate={{
                        required: { value: true, errorMessage: 'Required.' },
                        minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                        maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                      }}
                    />
                    {/* Country */}
                    <AvField
                      name="country"
                      label="Country"
                      validate={{
                        required: { value: true, errorMessage: 'Required.' },
                        minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                        maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md={9} className={'ml-auto'}>
                    <Button id="register-submit" color="primary" type="submit">
                      Register
                    </Button>
                  </Col>
                </Row>
              </>
            ) : null}
          </AvForm>
        </Col>
      </Row>
    );
  }
}
