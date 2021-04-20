import React from 'react';
import {
  AvCheckbox,
  AvCheckboxGroup,
  AvField,
  AvForm,
  AvRadio,
  AvRadioGroup,
} from 'availity-reactstrap-validation';
import PasswordStrengthBar from 'app/shared/password/password-strength-bar';
import { observer } from 'mobx-react';
import { action, observable, computed } from 'mobx';
import autobind from 'autobind-decorator';
import { ManagedUserVM } from 'app/shared/api/generated/API';
import {
  ACADEMIC_TERMS,
  ACCOUNT_TITLES,
  LicenseType,
  THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT,
  XREGEXP_VALID_LATIN_TEXT,
} from 'app/config/constants';
import { Button, Col, Row } from 'react-bootstrap';
import LicenseExplanation from 'app/shared/texts/LicenseExplanation';
import { ButtonSelections } from 'app/components/LicenseSelection';
import { LicenseInquireLink } from 'app/shared/links/LicenseInquireLink';
import * as XRegExp from 'xregexp';
import {
  getAccountInfoTitle,
  getSectionClassName,
} from 'app/pages/account/AccountUtils';
import { If, Then } from 'react-if';

export type INewAccountForm = {
  isLargeScreen: boolean;
  byAdmin: boolean;
  defaultLicense?: LicenseType;
  onSelectLicense?: (newLicenseType: LicenseType | undefined) => void;
  onSubmit: (newUser: Partial<ManagedUserVM>) => void;
};

export enum AccountType {
  REGULAR = 'regular',
  TRIAL = 'trial',
}

export const ACCOUNT_TYPE_DEFAULT = AccountType.REGULAR;
@observer
export class NewAccountForm extends React.Component<INewAccountForm> {
  @observable password = '';
  @observable selectedLicense: LicenseType | undefined;
  @observable selectedAccountType = ACCOUNT_TYPE_DEFAULT;

  private defaultFormValue = {
    accountType: ACCOUNT_TYPE_DEFAULT,
    tokenValidDays: THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT,
  };

  private textValidation = {
    pattern: {
      value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
      errorMessage: 'Sorry, we only support Latin letters for now.',
    },
    minLength: {
      value: 1,
      errorMessage: 'Required to be at least 1 character',
    },
    maxLength: {
      value: 50,
      errorMessage: 'Cannot be longer than 50 characters',
    },
  };

  private shortTextValidation = {
    ...this.textValidation,
    maxLength: {
      value: 50,
      errorMessage: 'Cannot be longer than 50 characters',
    },
  };

  constructor(props: INewAccountForm) {
    super(props);
    if (props.defaultLicense) {
      this.selectedLicense = props.defaultLicense;
    }
  }

  @autobind
  @action
  handleValidSubmit(event: any, values: any) {
    const newUser: Partial<ManagedUserVM> = {
      login: values.email,
      password: this.password,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      licenseType: this.selectedLicense,
      tokenIsRenewable: this.selectedAccountType !== AccountType.TRIAL,
      jobTitle: values.jobTitle,
      company: values.company,
      city: values.city,
      country: values.country,
    };
    if (values.tokenValidDays) {
      newUser.tokenValidDays = Number(values.tokenValidDays);
    }
    this.props.onSubmit(newUser);
  }

  getLicenseAdditionalInfo(licenseType: LicenseType) {
    if (licenseType === LicenseType.ACADEMIC) {
      return (
        <div>
          OncoKB is accessible for no fee for research use in academic setting.
          This license type requires that you register your account using your
          institution/university email address.{' '}
          <b>Please complete the form below to create your OncoKB account.</b>
        </div>
      );
    } else if (licenseType === LicenseType.COMMERCIAL) {
      return (
        <div>
          <p>
            To use OncoKB in a commercial product, your company will need a
            license. A typical example of this is if you are part of a company
            that would like to incorporate OncoKB content into sequencing
            reports.
          </p>
          <p>
            <b>Please complete the form below to create your OncoKB account.</b>{' '}
            If your company already has a license, you can skip certain fields
            and we will grant you API access shortly. Otherwise, we will contact
            you with license terms. You can also reach out to{' '}
            <LicenseInquireLink /> for more information.
          </p>
        </div>
      );
    } else if (licenseType === LicenseType.HOSPITAL) {
      return (
        <div>
          <p>
            To incorporate OncoKB content into patient sequencing reports, your
            hospital will need a license.
          </p>
          <p>
            <b>Please complete the form below to create your OncoKB account.</b>{' '}
            If your hospital already has a license, we will grant you API access
            shortly. Otherwise, we will contact you with license terms. You can
            also reach out to <LicenseInquireLink /> for more information.
          </p>
        </div>
      );
    } else if (licenseType === LicenseType.RESEARCH_IN_COMMERCIAL) {
      return (
        <div>
          <p>
            To use OncoKB for research purposes in a commercial setting, your
            company will need a license.
          </p>
          <p>
            <b>Please complete the form below to create your OncoKB account.</b>{' '}
            If your company already has a license, we will grant you API access
            shortly. Otherwise, we will contact you with license terms. You can
            also reach out to <LicenseInquireLink /> for more information.
          </p>
        </div>
      );
    }
  }

  @computed
  get isCommercialLicense() {
    return this.selectedLicense !== LicenseType.ACADEMIC;
  }

  @computed
  get companyDescriptionPlaceholder() {
    const commonDescription =
      'Provide a brief description of the ' +
      getAccountInfoTitle(
        ACCOUNT_TITLES.COMPANY,
        this.selectedLicense
      ).toLowerCase();

    if (this.isCommercialLicense) {
      return (
        commonDescription +
        ':\n' +
        ' - Key products and services that relate to OncoKB\n' +
        ' - Approximate size of the company (e.g., FTE, revenue, etc.)'
      );
    }
    return commonDescription;
  }

  @computed
  get useCasePlaceholder() {
    const commonDescription =
      'Provide a description of how you plan to use OncoKB';

    if (this.isCommercialLicense) {
      return (
        commonDescription +
        '\n' +
        '  - What product or service do you plan to incorporate OncoKB content into?\n' +
        '  - How will the product be delivered to the end user (e.g., patient report, SaaS offering)?'
      );
    }
    return commonDescription;
  }

  @autobind
  @action
  onSelectLicense(license: LicenseType | undefined) {
    this.selectedLicense = license;
    if (this.props.onSelectLicense) {
      this.props.onSelectLicense(this.selectedLicense);
    }
  }

  @autobind
  updatePassword(event: any) {
    this.password = event.target.value;
  }

  render() {
    return (
      <AvForm
        onValidSubmit={this.handleValidSubmit}
        model={this.defaultFormValue}
      >
        <Row className={getSectionClassName(true)}>
          <Col xs={12}>
            <h6>
              <LicenseExplanation />
            </h6>
          </Col>
        </Row>
        <Row className={getSectionClassName(false)}>
          <Col md="3">
            <h5>Choose your license type</h5>
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
                  name="firstName"
                  autoComplete="given-name"
                  label={getAccountInfoTitle(
                    ACCOUNT_TITLES.FIRST_NAME,
                    this.selectedLicense
                  )}
                  validate={{
                    required: {
                      value: true,
                      errorMessage: 'Your first name is required.',
                    },
                    ...this.textValidation,
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
                      errorMessage: 'Your last name is required.',
                    },
                    ...this.textValidation,
                  }}
                />
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
                      errorMessage: 'Your email is required.',
                    },
                    minLength: {
                      value: 5,
                      errorMessage:
                        'Your email is required to be at least 5 characters.',
                    },
                    maxLength: {
                      value: 254,
                      errorMessage:
                        'Your email cannot be longer than 50 characters.',
                    },
                  }}
                />
                <If condition={!this.props.byAdmin}>
                  <Then>
                    <AvField
                      name="firstPassword"
                      label="Password"
                      autoComplete="password"
                      placeholder={'Password'}
                      type="password"
                      onChange={this.updatePassword}
                      validate={{
                        required: {
                          value: true,
                          errorMessage: 'Your password is required.',
                        },
                        minLength: {
                          value: 4,
                          errorMessage:
                            'Your password is required to be at least 4 characters.',
                        },
                        maxLength: {
                          value: 50,
                          errorMessage:
                            'Your password cannot be longer than 50 characters.',
                        },
                      }}
                    />
                    <PasswordStrengthBar password={this.password} />
                    <AvField
                      name="secondPassword"
                      label="Password confirmation"
                      autoComplete="password"
                      placeholder="Confirm the password"
                      type="password"
                      validate={{
                        required: {
                          value: true,
                          errorMessage:
                            'Your confirmation password is required.',
                        },
                        minLength: {
                          value: 4,
                          errorMessage:
                            'Your confirmation password is required to be at least 4 characters.',
                        },
                        maxLength: {
                          value: 50,
                          errorMessage:
                            'Your confirmation password cannot be longer than 50 characters.',
                        },
                        match: {
                          value: 'firstPassword',
                          errorMessage:
                            'The password and its confirmation do not match!',
                        },
                      }}
                    />
                  </Then>
                </If>
                <AvField
                  name="jobTitle"
                  label={getAccountInfoTitle(
                    ACCOUNT_TITLES.POSITION,
                    this.selectedLicense
                  )}
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
                <AvField
                  name="company"
                  label={getAccountInfoTitle(
                    ACCOUNT_TITLES.COMPANY,
                    this.selectedLicense
                  )}
                />
                <AvField
                  name="city"
                  label={getAccountInfoTitle(
                    ACCOUNT_TITLES.CITY,
                    this.selectedLicense
                  )}
                />
                <AvField
                  name="country"
                  label={getAccountInfoTitle(
                    ACCOUNT_TITLES.COUNTRY,
                    this.selectedLicense
                  )}
                />
                <AvField
                  name="companyDescription"
                  label={`${getAccountInfoTitle(
                    ACCOUNT_TITLES.COMPANY,
                    this.selectedLicense
                  )} Description`}
                  type={'textarea'}
                  placeholder={this.companyDescriptionPlaceholder}
                  rows={4}
                />
                {this.isCommercialLicense && (
                  <AvField
                    name="businessContact"
                    label={'Business Contact'}
                    placeholder={'Provide email and phone number'}
                  />
                )}
                <AvField
                  name="useCase"
                  label={'Describe how you plan to use OncoKB'}
                  type={'textarea'}
                  placeholder={this.useCasePlaceholder}
                  rows={6}
                />
                {[LicenseType.COMMERCIAL, LicenseType.HOSPITAL].includes(
                  this.selectedLicense
                ) && (
                  <AvField
                    name="numOfReports"
                    label={
                      'Anticipated # of reports annually for years 1, 2 and 3'
                    }
                    type={'textarea'}
                    placeholder={
                      'If you plan to incorporate OncoKB contents in sequencing reports, please provide an estimate of your anticipated volume over the next several years'
                    }
                  />
                )}
                {[LicenseType.RESEARCH_IN_COMMERCIAL].includes(
                  this.selectedLicense
                ) && (
                  <AvField
                    name="companySize"
                    label={'Company Size (# of employees)'}
                    type={'input'}
                  />
                )}
              </Col>
            </Row>
            {this.selectedLicense === LicenseType.ACADEMIC &&
            !this.props.byAdmin ? (
              <>
                <Row className={getSectionClassName()}>
                  <Col md="3">
                    <h5>Terms</h5>
                  </Col>
                  <Col md="9">
                    <p>
                      In order to be granted access to downloadable content and
                      our API, please agree to the following terms:
                    </p>
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
            {this.props.byAdmin ? (
              <Row className={getSectionClassName()}>
                <Col md="3">
                  <h5>Account Type</h5>
                </Col>
                <Col md="9">
                  <AvRadioGroup
                    inline
                    name="accountType"
                    label=""
                    required
                    onChange={(event: any, values: any) => {
                      if (values) {
                        this.selectedAccountType = values;
                      } else {
                        this.selectedAccountType = ACCOUNT_TYPE_DEFAULT;
                      }
                    }}
                  >
                    <AvRadio
                      label={AccountType.REGULAR}
                      value={AccountType.REGULAR}
                    />
                    <AvRadio
                      label={AccountType.TRIAL}
                      value={AccountType.TRIAL}
                    />
                  </AvRadioGroup>
                  {this.selectedAccountType === AccountType.TRIAL ? (
                    <div className={'mt-2'}>
                      <AvField
                        name="tokenValidDays"
                        label="Account Expires in Days"
                        required
                        validate={{ number: true }}
                      />
                    </div>
                  ) : null}
                </Col>
              </Row>
            ) : null}
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
