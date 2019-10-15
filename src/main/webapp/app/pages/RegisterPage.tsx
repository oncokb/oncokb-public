import React from 'react';
import { AvField, AvForm, AvCheckboxGroup, AvCheckbox} from 'availity-reactstrap-validation';
import { Alert, Button, Col, Row, Label } from 'reactstrap';
import PasswordStrengthBar from 'app/shared/password/password-strength-bar';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import { Link, Redirect } from 'react-router-dom';
import client from 'app/shared/api/clientInstance';
import { ManagedUserVM } from 'app/shared/api/generated/API';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { ACADEMIC_TERMS, ACCOUNT_TITLES, LICENSE_TYPES, LicenseType, PAGE_ROUTE } from 'app/config/constants';
import { getAccountInfoTitle, getSectionClassName } from './account/AccountUtils';
import SmallPageContainer from 'app/components/SmallComponentContainer';
import Form from 'react-bootstrap/Form';

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
  @observable registerError: any;
  @observable selectedLicense: LicenseType | undefined;

  private redirectTimeoutInSecond = 5;
  private newAccount: Partial<ManagedUserVM>;

  @autobind
  @action
  handleValidSubmit(event: any, values: any) {
    this.newAccount = {
      login: values.email,
      password: values.firstPassword,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      licenseType: this.selectedLicense,
      jobTitle: values.jobTitle,
      company: values.company,
      city: values.city,
      country: values.country
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
  failedToRegistered(error: any) {
    this.registerStatus = RegisterStatus.NOT_SUCCESS;
    this.registerError = error;
    window.scrollTo(0, 0);
  }

  getErrorMessage(additionalInfo = '') {
    return (additionalInfo ? `${additionalInfo}, w` : 'W') + 'e were not able to create an account for you.';
  }

  @computed
  get errorRegisterMessage() {
    if (this.registerError &&
      this.registerError.response &&
      this.registerError.response.body &&
      this.registerError.response.body.title
    ) {
      return this.getErrorMessage(this.registerError.response.body.title);
    } else {
      return this.getErrorMessage();
    }
  }

  getLicenseAdditionalInfo(licenseType: LicenseType) {
    if (licenseType === LicenseType.ACADEMIC) {
      return <div>OncoKB data is freely accessible for research use in the academic setting. Please register below for
        access.</div>;
    } else {
      return (
        <div>
          <div>To support the future development and maintenance of OncoKB, we have introduced license fees for clinical
            and commercial use. The fee will depend on the type of use and size of company.
          </div>
          <div className='mt-2'>In order to be granted access to downloadable content and our API, your company will
            need a license. If
            your company already has one, we will grant you access. Otherwise, we will contact you to discuss your needs
            and license terms. Please see the <Link to={PAGE_ROUTE.TERMS}>OncoKB Terms of Use</Link>.
          </div>
        </div>
      );
    }
  }

  @autobind
  @action
  onSelectLicense(license: LicenseType | undefined) {
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

    return (
      <SmallPageContainer className={'registerPage'}>
        {this.registerStatus === RegisterStatus.NOT_SUCCESS ? (
          <div>
            <Alert color="danger">{this.errorRegisterMessage}</Alert>
          </div>
        ) : null}
        <AvForm id="register-form" onValidSubmit={this.handleValidSubmit}>
          <Row className={getSectionClassName(true)}>
            <Col>
              <b>OncoKB data is freely accessible for research use in the academic setting. To support the future development and maintenance of OncoKB, we have introduced license fees for clinical and commercial use. See our <Link to={PAGE_ROUTE.TERMS}>usage terms</Link> for further information.</b>
            </Col>
          </Row>
          <Row className={getSectionClassName(false)}>
            <Col md='3'>
              <h5>Choose License</h5>
            </Col>
            <Col md="9">
              {LICENSE_TYPES.map((license, index) => (
                <div className='primary'
                     key={license.key}
                     onClick={() => this.onSelectLicense(license.key)}
                >
                  <Form.Check
                    className={'px-0'}
                    type="checkbox"
                    label={license.title}
                    readOnly
                    checked={this.selectedLicense === license.key}
                  />
                </div>
              ))}
            </Col>
          </Row>
          {this.selectedLicense ? (
            <>
              <Row className={getSectionClassName()}>
                <Col md="9" className={'ml-auto'}>
                  {this.getLicenseAdditionalInfo(this.selectedLicense)}
                </Col>
              </Row>
              <Row className={getSectionClassName()}>
                <Col md='3'>
                  <h5>Account</h5>
                </Col>
                <Col md="9">
                  <AvField
                    name="email"
                    label={getAccountInfoTitle(ACCOUNT_TITLES.EMAIL, this.selectedLicense)}
                    type="email"
                    validate={{
                      required: { value: true, errorMessage: 'Your email is required.' },
                      minLength: { value: 5, errorMessage: 'Your email is required to be at least 5 characters.' },
                      maxLength: { value: 254, errorMessage: 'Your email cannot be longer than 50 characters.' }
                    }}
                  />
                  <AvField
                    name="firstName"
                    autoComplete='given-name'
                    label={getAccountInfoTitle(ACCOUNT_TITLES.FIRST_NAME, this.selectedLicense)}
                    validate={{
                      required: { value: true, errorMessage: 'Your first name is required.' },
                      minLength: { value: 1, errorMessage: 'Your first can not be empty' }
                    }}
                  />
                  <AvField
                    name="lastName"
                    autoComplete='family-name'
                    label={getAccountInfoTitle(ACCOUNT_TITLES.LAST_NAME, this.selectedLicense)}
                    validate={{
                      required: { value: true, errorMessage: 'Your last name is required.' },
                      minLength: { value: 1, errorMessage: 'Your last name can not be empty' }
                    }}
                  />
                  <AvField
                    name="firstPassword"
                    label="New password"
                    autoComplete='new-password'
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
                    autoComplete='new-password'
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
              <Row className={getSectionClassName()}>
                <Col md='3'>
                  <h5>{getAccountInfoTitle(ACCOUNT_TITLES.COMPANY, this.selectedLicense)}</h5>
                </Col>
                <Col md="9">
                  {/* Job Title */}
                  <AvField
                    name="jobTitle"
                    label={getAccountInfoTitle(ACCOUNT_TITLES.POSITION, this.selectedLicense)}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                      maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                    }}
                  />
                  {/* Company */}
                  <AvField
                    name="company"
                    label={getAccountInfoTitle(ACCOUNT_TITLES.COMPANY, this.selectedLicense)}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                      maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                    }}
                  />
                  {/* City */}
                  <AvField
                    name="city"
                    label={getAccountInfoTitle(ACCOUNT_TITLES.CITY, this.selectedLicense)}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                      maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                    }}
                  />
                  {/* Country */}
                  <AvField
                    name="country"
                    label={getAccountInfoTitle(ACCOUNT_TITLES.COUNTRY, this.selectedLicense)}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      minLength: { value: 1, errorMessage: 'Required to be at least 1 character' },
                      maxLength: { value: 50, errorMessage: 'Cannot be longer than 50 characters' }
                    }}
                  />
                </Col>
              </Row>
              {this.selectedLicense === LicenseType.ACADEMIC ? (
                <>
                  <Row className={getSectionClassName()}>
                    <Col md='9' className={'ml-auto'}>
                      In order to be granted access to downloadable content and our API, please
                      agree to the following terms:
                    </Col>
                  </Row>
                  <Row className={getSectionClassName()}>
                    <Col md='3'>
                      <h5>Terms</h5>
                    </Col>
                    <Col md='9'>
                      {ACADEMIC_TERMS.map(term => (
                        <AvCheckboxGroup name={term.key} required key={term.key}
                                         errorMessage={'You have to accept the term'}>
                          <AvCheckbox label={term.description} value={term.key}/>
                        </AvCheckboxGroup>
                      ))}
                    </Col>
                  </Row>
                </>
              ) : null}
              <Row>
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
      </SmallPageContainer>
    );
  }
}
