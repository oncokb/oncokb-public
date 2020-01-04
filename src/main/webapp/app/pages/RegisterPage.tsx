import React from 'react';
import {
  AvField,
  AvForm,
  AvCheckboxGroup,
  AvCheckbox
} from 'availity-reactstrap-validation';
import PasswordStrengthBar from 'app/shared/password/password-strength-bar';
import { inject, observer } from 'mobx-react';
import {
  action,
  computed,
  observable,
  reaction,
  IReactionDisposer
} from 'mobx';
import autobind from 'autobind-decorator';
import { Link, Redirect } from 'react-router-dom';
import client from 'app/shared/api/clientInstance';
import { ManagedUserVM } from 'app/shared/api/generated/API';
import AuthenticationStore from 'app/store/AuthenticationStore';
import {
  ACADEMIC_TERMS,
  ACCOUNT_TITLES,
  LicenseType,
  PAGE_ROUTE,
  QUERY_SEPARATOR_FOR_QUERY_STRING
} from 'app/config/constants';
import {
  getAccountInfoTitle,
  getSectionClassName
} from './account/AccountUtils';
import { Alert, Row, Col, Button } from 'react-bootstrap';
import LicenseExplanation from 'app/shared/texts/LicenseExplanation';
import { RouterStore } from 'mobx-react-router';
import * as QueryString from 'query-string';
import { ButtonSelections } from 'app/components/LicenseSelection';
import { LicenseInquireLink } from 'app/shared/links/LicenseInquireLink';
import WindowStore from 'app/store/WindowStore';
import SmallPageContainer from 'app/components/SmallPageContainer';
import MessageToContact from 'app/shared/texts/MessageToContact';
import * as XRegExp from "xregexp";

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
  routing: RouterStore;
  authenticationStore: AuthenticationStore;
  windowStore: WindowStore;
  handleRegister: (newUser: NewUserRequiredFields) => void;
};

export const LICENSE_HASH_KEY = 'license';

@inject('authenticationStore', 'routing', 'windowStore')
@observer
export class RegisterPage extends React.Component<IRegisterProps> {
  @observable password = '';
  @observable registerStatus: RegisterStatus = RegisterStatus.NA;
  @observable registerError: any;
  @observable selectedLicense: LicenseType | undefined;

  private newAccount: Partial<ManagedUserVM>;
  readonly reactions: IReactionDisposer[] = [];

  constructor(props: Readonly<IRegisterProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING
          });
          if (queryStrings[LICENSE_HASH_KEY]) {
            this.selectedLicense = queryStrings[
              LICENSE_HASH_KEY
            ] as LicenseType;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.selectedLicense,
        newSelection => {
          const parsedHashQueryString = QueryString.stringify(
            {
              [LICENSE_HASH_KEY]: newSelection
            },
            { arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING }
          );
          window.location.hash = parsedHashQueryString;
        }
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

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
    // setTimeout(this.redirectToAccountPage, REDIRECT_TIMEOUT_MILLISECONDS);
  }

  @action.bound
  failedToRegistered(error: any) {
    this.registerStatus = RegisterStatus.NOT_SUCCESS;
    this.registerError = error;
    window.scrollTo(0, 0);
  }

  getErrorMessage(additionalInfo = '') {
    return (
      (additionalInfo ? `${additionalInfo}, w` : 'W') +
      'e were not able to create an account for you.'
    );
  }

  @computed
  get errorRegisterMessage() {
    if (
      this.registerError &&
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
      return (
        <div>
          OncoKB is accessible for no fee for research use in academic setting.
          This license type requires that you register your account using your
          institution/university email address. Please register below for
          access.
        </div>
      );
    } else {
      return (
        <div>
          <div className="mt-2">
            In order to be granted access to downloadable content and our API,
            your company will need a license. If your company already has one,
            we will grant you access. Otherwise, we will contact you to discuss
            your needs and license terms. You can also reach out to{' '}
            <LicenseInquireLink /> for more information.
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
      return <Redirect to={'/'} />;
    }

    if (this.registerStatus === RegisterStatus.REGISTERED) {
      return (
        <SmallPageContainer className={'registerPage'}>
          <div>
            <Alert variant="info">
              <p className={'mb-3'}>
                Thank you for creating an OncoKB account. We have sent you an
                email to verify your email address. Please follow the
                instructions in the email to complete registration.
              </p>
              <MessageToContact emailTitle={'Registration Question'} />
              <p>
                <div>Sincerely,</div>
                <div>The OncoKB Team</div>
              </p>
            </Alert>
          </div>
        </SmallPageContainer>
      );
    }

    return (
      <div className={'registerPage'}>
        {this.registerStatus === RegisterStatus.NOT_SUCCESS ? (
          <div>
            <Alert variant="danger">{this.errorRegisterMessage}</Alert>
          </div>
        ) : null}
        <AvForm id="register-form" onValidSubmit={this.handleValidSubmit}>
          <Row className={getSectionClassName(true)}>
            <Col xs={12}>
              <h6>
                <LicenseExplanation />
              </h6>
            </Col>
          </Row>
          <Row className={getSectionClassName(false)}>
            <Col md="3">
              <h5>Choose License</h5>
            </Col>
            <Col md="9">
              <ButtonSelections
                isLargeScreen={this.props.windowStore.isLargeScreen}
                selectedButton={this.selectedLicense}
                onSelectLicense={this.onSelectLicense}
              />
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
                <Col md="3">
                  <h5>Account</h5>
                </Col>
                <Col md="9">
                  <AvField
                    name="email"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.EMAIL,
                      this.selectedLicense
                    )}
                    type="email"
                    validate={{
                      required: {
                        value: true,
                        errorMessage: 'Your email is required.'
                      },
                      minLength: {
                        value: 5,
                        errorMessage:
                          'Your email is required to be at least 5 characters.'
                      },
                      maxLength: {
                        value: 254,
                        errorMessage:
                          'Your email cannot be longer than 50 characters.'
                      }
                    }}
                  />
                  <AvField
                    name="firstName"
                    autoComplete="given-name"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.FIRST_NAME,
                      this.selectedLicense
                    )}
                    validate={{
                      required: {
                        value: true,
                        errorMessage: 'Your first name is required.'
                      },
                      pattern: {
                        value: XRegExp('^[\\p{Latin}\\s]+$'),
                        errorMessage: 'Sorry, we only support Latin letters for now.'
                      },
                      minLength: {
                        value: 1,
                        errorMessage: 'Your first can not be empty'
                      }
                    }}
                  />
                  <AvField
                    name="lastName"
                    autoComplete="family-name"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.LAST_NAME,
                      this.selectedLicense
                    )}
                    validate={{
                      required: {
                        value: true,
                        errorMessage: 'Your last name is required.'
                      },
                      pattern: {
                        value: XRegExp('^[\\p{Latin}\\s]+$'),
                        errorMessage: 'Sorry, we only support Latin letters for now.'
                      },
                      minLength: {
                        value: 1,
                        errorMessage: 'Your last name can not be empty'
                      }
                    }}
                  />
                  <AvField
                    name="firstPassword"
                    label="New password"
                    autoComplete="new-password"
                    placeholder={'New password'}
                    type="password"
                    onChange={this.updatePassword}
                    validate={{
                      required: {
                        value: true,
                        errorMessage: 'Your password is required.'
                      },
                      minLength: {
                        value: 4,
                        errorMessage:
                          'Your password is required to be at least 4 characters.'
                      },
                      maxLength: {
                        value: 50,
                        errorMessage:
                          'Your password cannot be longer than 50 characters.'
                      }
                    }}
                  />
                  <PasswordStrengthBar password={this.password} />
                  <AvField
                    name="secondPassword"
                    label="New password confirmation"
                    autoComplete="new-password"
                    placeholder="Confirm the new password"
                    type="password"
                    validate={{
                      required: {
                        value: true,
                        errorMessage: 'Your confirmation password is required.'
                      },
                      minLength: {
                        value: 4,
                        errorMessage:
                          'Your confirmation password is required to be at least 4 characters.'
                      },
                      maxLength: {
                        value: 50,
                        errorMessage:
                          'Your confirmation password cannot be longer than 50 characters.'
                      },
                      match: {
                        value: 'firstPassword',
                        errorMessage:
                          'The password and its confirmation do not match!'
                      }
                    }}
                  />
                </Col>
              </Row>
              <Row className={getSectionClassName()}>
                <Col md="3">
                  <h5>
                    {getAccountInfoTitle(
                      ACCOUNT_TITLES.COMPANY,
                      this.selectedLicense
                    )}
                  </h5>
                </Col>
                <Col md="9">
                  {/* Job Title */}
                  <AvField
                    name="jobTitle"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.POSITION,
                      this.selectedLicense
                    )}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      minLength: {
                        value: 1,
                        errorMessage: 'Required to be at least 1 character'
                      },
                      pattern: {
                        value: XRegExp('^[\\p{Latin}\\p{Common}\\s]+$'),
                        errorMessage: 'Sorry, we only support Latin letters for now.'
                      },
                      maxLength: {
                        value: 50,
                        errorMessage: 'Cannot be longer than 50 characters'
                      }
                    }}
                  />
                  {/* Company */}
                  <AvField
                    name="company"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.COMPANY,
                      this.selectedLicense
                    )}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      minLength: {
                        value: 1,
                        errorMessage: 'Required to be at least 1 character'
                      },
                      pattern: {
                        value: XRegExp('^[\\p{Latin}\\p{Common}\\s]+$'),
                        errorMessage: 'Sorry, we only support Latin letters for now.'
                      },
                      maxLength: {
                        value: 50,
                        errorMessage: 'Cannot be longer than 50 characters'
                      }
                    }}
                  />
                  {/* City */}
                  <AvField
                    name="city"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.CITY,
                      this.selectedLicense
                    )}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      minLength: {
                        value: 1,
                        errorMessage: 'Required to be at least 1 character'
                      },
                      pattern: {
                        value: XRegExp('^[\\p{Latin}\\p{Common}\\s]+$'),
                        errorMessage: 'Sorry, we only support Latin letters for now.'
                      },
                      maxLength: {
                        value: 50,
                        errorMessage: 'Cannot be longer than 50 characters'
                      }
                    }}
                  />
                  {/* Country */}
                  <AvField
                    name="country"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.COUNTRY,
                      this.selectedLicense
                    )}
                    validate={{
                      required: { value: true, errorMessage: 'Required.' },
                      pattern: {
                        value: XRegExp('^[\\p{Latin}\\p{Common}\\s]+$'),
                        errorMessage: 'Sorry, we only support Latin letters for now.'
                      },
                      minLength: {
                        value: 1,
                        errorMessage: 'Required to be at least 1 character'
                      },
                      maxLength: {
                        value: 50,
                        errorMessage: 'Cannot be longer than 50 characters'
                      }
                    }}
                  />
                </Col>
              </Row>
              {this.selectedLicense === LicenseType.ACADEMIC ? (
                <>
                  <Row className={getSectionClassName()}>
                    <Col md="9" className={'ml-auto'}>
                      In order to be granted access to downloadable content and
                      our API, please agree to the following terms:
                    </Col>
                  </Row>
                  <Row className={getSectionClassName()}>
                    <Col md="3">
                      <h5>Terms</h5>
                    </Col>
                    <Col md="9">
                      {ACADEMIC_TERMS.map(term => (
                        <AvCheckboxGroup
                          name={term.key}
                          required
                          key={term.key}
                          errorMessage={'You have to accept the term'}
                        >
                          <AvCheckbox
                            label={term.description}
                            value={term.key}
                          />
                        </AvCheckboxGroup>
                      ))}
                    </Col>
                  </Row>
                </>
              ) : null}
              <Row></Row>
              <Row>
                <Col md={9} className={'ml-auto'}>
                  <Button id="register-submit" variant="primary" type="submit">
                    Register
                  </Button>
                </Col>
              </Row>
            </>
          ) : null}
        </AvForm>
      </div>
    );
  }
}
