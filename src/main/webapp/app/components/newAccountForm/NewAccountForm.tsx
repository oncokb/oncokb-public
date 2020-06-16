import React from 'react';
import {
  AvField,
  AvForm,
  AvCheckboxGroup,
  AvCheckbox
} from 'availity-reactstrap-validation';
import PasswordStrengthBar from 'app/shared/password/password-strength-bar';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import autobind from 'autobind-decorator';
import { ManagedUserVM } from 'app/shared/api/generated/API';
import {
  ACADEMIC_TERMS,
  ACCOUNT_TITLES,
  LicenseType
} from 'app/config/constants';
import { Row, Col, Button, Form } from 'react-bootstrap';
import LicenseExplanation from 'app/shared/texts/LicenseExplanation';
import { ButtonSelections } from 'app/components/LicenseSelection';
import { LicenseInquireLink } from 'app/shared/links/LicenseInquireLink';
import * as XRegExp from 'xregexp';
import {
  getSectionClassName,
  getAccountInfoTitle
} from 'app/pages/account/AccountUtils';
import { If, Then, Else } from 'react-if';

export type INewAccountForm = {
  isLargeScreen: boolean;
  defaultLicense?: LicenseType;
  generatePassword: boolean;
  onSelectLicense?: (newLicenseType: LicenseType | undefined) => void;
  onSubmit: (newUser: Partial<ManagedUserVM>) => void;
};

@observer
export class NewAccountForm extends React.Component<INewAccountForm> {
  @observable password = '';
  @observable selectedLicense: LicenseType | undefined;

  constructor(props: INewAccountForm) {
    super(props);
    if (props.defaultLicense) {
      this.selectedLicense = props.defaultLicense;
    }
  }

  @autobind
  @action
  handleValidSubmit(event: any, values: any) {
    this.props.onSubmit({
      login: values.email,
      password: this.password,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      licenseType: this.selectedLicense,
      jobTitle: values.jobTitle,
      company: values.company,
      city: values.city,
      country: values.country
    });
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
    if (this.props.onSelectLicense) {
      this.props.onSelectLicense(this.selectedLicense);
    }
  }

  // The code is from https://github.com/bryanbraun/alt-react-demo/blob/master/components/password.js
  @action
  generatePassword() {
    const charset = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let newPassword = '';

    for (let i = 0; i < 5; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    this.password = newPassword;
  }

  @autobind
  updatePassword(event: any) {
    this.password = event.target.value;
  }

  render() {
    return (
      <AvForm onValidSubmit={this.handleValidSubmit}>
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
              isLargeScreen={this.props.isLargeScreen}
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
                  onChange={() => {
                    if (this.props.generatePassword) {
                      this.generatePassword();
                    }
                  }}
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
                      errorMessage:
                        'Sorry, we only support Latin letters for now.'
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
                      errorMessage:
                        'Sorry, we only support Latin letters for now.'
                    },
                    minLength: {
                      value: 1,
                      errorMessage: 'Your last name can not be empty'
                    }
                  }}
                />
                <If condition={this.props.generatePassword}>
                  <Then>
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Text as={'b'}>{this.password}</Form.Text>
                    </Form.Group>
                  </Then>
                  <Else>
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
                          errorMessage:
                            'Your confirmation password is required.'
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
                  </Else>
                </If>
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
                      errorMessage:
                        'Sorry, we only support Latin letters for now.'
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
                      errorMessage:
                        'Sorry, we only support Latin letters for now.'
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
                      errorMessage:
                        'Sorry, we only support Latin letters for now.'
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
                      errorMessage:
                        'Sorry, we only support Latin letters for now.'
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
                        <AvCheckbox label={term.description} value={term.key} />
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
    );
  }
}
