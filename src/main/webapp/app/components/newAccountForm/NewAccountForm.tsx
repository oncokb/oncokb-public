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
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import {
  AdditionalInfoDTO,
  CompanyDTO,
  Contact,
  ManagedUserVM,
} from 'app/shared/api/generated/API';
import {
  ACADEMIC_TERMS,
  ACCOUNT_TITLES,
  LicenseStatus,
  LicenseType,
  ONCOKB_TM,
  THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT,
} from 'app/config/constants';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import LicenseExplanation from 'app/shared/texts/LicenseExplanation';
import { ButtonSelections } from 'app/components/LicenseSelection';
import { LicenseInquireLink } from 'app/shared/links/LicenseInquireLink';
import {
  getAccountInfoTitle,
  getSectionClassName,
} from 'app/pages/account/AccountUtils';
import { If, Then } from 'react-if';
import _ from 'lodash';
import { FormSelectWithLabelField } from 'app/shared/select/FormSelectWithLabelField';
import client from 'app/shared/api/clientInstance';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import {
  EMAIL_VAL,
  LONG_TEXT_VAL,
  SHORT_TEXT_VAL,
  TEXT_VAL,
  OPTIONAL_TEXT_VAL,
  textValidation,
} from 'app/shared/utils/FormValidationUtils';
import { NOT_USED_IN_AI_MODELS } from 'app/config/constants/terms';

export enum FormSection {
  LICENSE = 'LICENSE',
  ACCOUNT = 'ACCOUNT',
  COMPANY = 'COMPANY',
}
export type INewAccountForm = {
  isLargeScreen: boolean;
  byAdmin: boolean;
  defaultLicense?: LicenseType;
  visibleSections?: FormSection[];
  onSelectLicense?: (newLicenseType: LicenseType | undefined) => void;
  onSubmit: (newUser: Partial<ManagedUserVM>) => void;
};

export enum AccountType {
  REGULAR = 'regular',
  TRIAL = 'trial',
}

enum FormKey {
  ANTICIPATED_REPORTS = 'anticipatedReports',
  COMPANY_DESCRIPTION = 'companyDescription',
  USE_CASE = 'useCase',
  COMPANY_SIZE = 'companySize',
  BUS_CONTACT_EMAIL = 'businessContactEmail',
  BUS_CONTACT_PHONE = 'businessContactPhone',
  REQUEST_API_ACCESS = 'requestApiAccess',
  API_ACCESS_JUSTIFICATION = 'apiAccessJustification',
}

type CompanySelectOptionType = {
  label: string;
  value: CompanyDTO;
};

export const SLACK_TEXT_VAL = textValidation(2, 1900);

export const ACCOUNT_TYPE_DEFAULT = AccountType.REGULAR;
@observer
export class NewAccountForm extends React.Component<INewAccountForm> {
  @observable password = '';
  @observable email = '';
  @observable selectedLicense: LicenseType | undefined;
  @observable selectedAccountType = ACCOUNT_TYPE_DEFAULT;
  @observable companyOptions: CompanySelectOptionType[] = [];
  @observable selectedCompanyOption: CompanySelectOptionType | undefined;
  @observable apiAccessRequested = false;

  private defaultFormValue = {
    accountType: ACCOUNT_TYPE_DEFAULT,
    tokenValidDays: THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT,
  };

  public static defaultProps = {
    visibleSections: Object.values(FormSection),
  };

  constructor(props: INewAccountForm) {
    super(props);
    if (props.defaultLicense) {
      this.selectedLicense = props.defaultLicense;
    }
    this.getAllCompanies();
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
      company: this.selectedCompanyOption?.value,
      companyName: this.selectedCompanyOption
        ? this.selectedCompanyOption.value.name
        : values.company,
      city: values.city,
      country: values.country,
    };
    const additionalInfo = this.constructAdditionalInfo(values);
    if (_.keys(additionalInfo).length > 0) {
      newUser.additionalInfo = additionalInfo;
    }
    if (values.tokenValidDays) {
      newUser.tokenValidDays = Number(values.tokenValidDays);
      newUser.notifyUserOnTrialCreation = true;
    }
    this.props.onSubmit(newUser);
  }

  constructAdditionalInfo(values: any) {
    const additionalInfo = {
      userCompany: {},
    } as AdditionalInfoDTO;
    if (values[FormKey.COMPANY_SIZE]) {
      additionalInfo.userCompany.size = values[FormKey.COMPANY_SIZE];
    }
    if (values[FormKey.COMPANY_DESCRIPTION]) {
      additionalInfo.userCompany.description =
        values[FormKey.COMPANY_DESCRIPTION];
    }
    [FormKey.ANTICIPATED_REPORTS, FormKey.USE_CASE].forEach(key => {
      if (values[key]) {
        additionalInfo.userCompany[key] = values[key];
      }
    });
    if (
      values[FormKey.BUS_CONTACT_EMAIL] ||
      values[FormKey.BUS_CONTACT_PHONE]
    ) {
      additionalInfo.userCompany.businessContact = {} as Contact;
      if (values[FormKey.BUS_CONTACT_EMAIL]) {
        additionalInfo.userCompany.businessContact.email =
          values[FormKey.BUS_CONTACT_EMAIL];
      }
      if (values[FormKey.BUS_CONTACT_PHONE]) {
        additionalInfo.userCompany.businessContact.phone =
          values[FormKey.BUS_CONTACT_PHONE];
      }
    }
    if (!this.isCommercialLicense) {
      additionalInfo.apiAccessRequest = {
        requested: this.apiAccessRequested,
        justification: values[FormKey.API_ACCESS_JUSTIFICATION],
      };
    }

    if (_.keys(additionalInfo.userCompany).length === 0) {
      delete additionalInfo.userCompany;
    }
    return additionalInfo;
  }

  getLicenseAdditionalInfo(licenseType: LicenseType) {
    if (licenseType === LicenseType.ACADEMIC) {
      return (
        <p>
          {ONCOKB_TM} is accessible for no fee for research use in academic
          setting. This license type requires that you register your account
          using your institution/university email address.{' '}
          <b>
            Please complete the form below to create your {ONCOKB_TM} account.
          </b>
        </p>
      );
    } else if (licenseType === LicenseType.COMMERCIAL) {
      return (
        <>
          <p>
            To use {ONCOKB_TM} in a commercial product, your company will need a
            license. A typical example of this is if you are part of a company
            that would like to incorporate {ONCOKB_TM} content into sequencing
            reports.
          </p>
          <p>
            <b>
              Please complete the form below to create your {ONCOKB_TM} account.
            </b>{' '}
            {this.props.visibleSections?.includes(FormSection.COMPANY) ? (
              <span>
                If your company already has a license, you can skip certain
                fields and we will grant you API access shortly. Otherwise, we
                will contact you with license terms.
              </span>
            ) : null}{' '}
            You can also reach out to <LicenseInquireLink /> for more
            information.
          </p>
        </>
      );
    } else if (licenseType === LicenseType.HOSPITAL) {
      return (
        <>
          <p>
            To incorporate {ONCOKB_TM} content into patient sequencing reports,
            your hospital will need a license.
          </p>
          <p>
            <b>
              Please complete the form below to create your {ONCOKB_TM} account.
            </b>{' '}
            {this.props.visibleSections?.includes(FormSection.COMPANY) ? (
              <span>
                If your hospital already has a license, we will grant you API
                access shortly. Otherwise, we will contact you with license
                terms.
              </span>
            ) : null}{' '}
            You can also reach out to <LicenseInquireLink /> for more
            information.
          </p>
        </>
      );
    } else if (licenseType === LicenseType.RESEARCH_IN_COMMERCIAL) {
      return (
        <>
          <p>
            To use {ONCOKB_TM} for research purposes in a commercial setting,
            your company will need a license.
          </p>
          <p>
            <b>
              Please complete the form below to create your {ONCOKB_TM} account.
            </b>{' '}
            {this.props.visibleSections?.includes(FormSection.COMPANY) ? (
              <span>
                If your company already has a license, we will grant you API
                access shortly. Otherwise, we will contact you with license
                terms.
              </span>
            ) : null}{' '}
            You can also reach out to <LicenseInquireLink /> for more
            information.
          </p>
        </>
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
        ` - Key products and services that relate to ${ONCOKB_TM}\n` +
        ` - Approximate size of the ${getAccountInfoTitle(
          ACCOUNT_TITLES.COMPANY,
          this.selectedLicense
        ).toLowerCase()} (e.g., FTE, revenue, etc.)`
      );
    }
    return commonDescription;
  }

  @computed
  get useCasePlaceholder() {
    const commonDescription = `Provide a description of how you plan to use ${ONCOKB_TM}`;

    if (this.isCommercialLicense) {
      return (
        commonDescription +
        '\n' +
        `  - What product or service do you plan to incorporate ${ONCOKB_TM} content into?\n` +
        `  - How will the product be delivered to the end user (e.g., patient report${
          this.selectedLicense === LicenseType.COMMERCIAL
            ? ', SaaS offering'
            : ''
        })?`
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

  @action
  getAllCompanies() {
    if (this.props.byAdmin) {
      client
        .getAllCompaniesUsingGET({})
        .then(
          companies =>
            (this.companyOptions = companies.map(company => ({
              label: `${company.name} (${company.companyType})`,
              value: company,
            })))
        )
        .catch(error => notifyError(error));
    }
  }

  @action.bound
  onSelectCompany(selectedOption: CompanySelectOptionType) {
    this.selectedCompanyOption = selectedOption;
    if (selectedOption) {
      this.selectedAccountType =
        this.selectedCompanyOption.value.licenseStatus === LicenseStatus.TRIAL
          ? AccountType.TRIAL
          : AccountType.REGULAR;
      this.onSelectLicense(selectedOption.value.licenseType as LicenseType);
    }
  }

  @computed
  get showEmailMismatchConfirmation() {
    const emailDomain = this.email.substring(
      this.email.includes('@') ? this.email.indexOf('@') + 1 : this.email.length
    );
    const hasADomainMatch = this.selectedCompanyOption?.value.companyDomains.some(
      domain => domain === emailDomain
    );
    return (
      this.email.length > 5 && this.selectedCompanyOption && !hasADomainMatch
    );
  }

  render() {
    return (
      <AvForm
        onValidSubmit={this.handleValidSubmit}
        model={this.defaultFormValue}
      >
        {this.props.visibleSections!.includes(FormSection.LICENSE) && (
          <>
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
                  disabled={!!this.selectedCompanyOption}
                />
                {!this.selectedCompanyOption ? null : (
                  <span>
                    User should have same license type as their company.
                    Unselect company to enable license selection.
                  </span>
                )}
              </Col>
            </Row>
          </>
        )}
        {this.selectedLicense ? (
          <>
            {this.props.visibleSections!.includes(FormSection.LICENSE) && (
              <Row>
                <Col md="9" className={'ml-auto'}>
                  {this.getLicenseAdditionalInfo(this.selectedLicense)}
                </Col>
              </Row>
            )}
            {this.props.visibleSections!.includes(FormSection.ACCOUNT) && (
              <Row
                className={
                  this.props.visibleSections!.includes(FormSection.LICENSE)
                    ? getSectionClassName()
                    : undefined
                }
              >
                <Col md="3">
                  <h5>Account Information</h5>
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
                      ...SHORT_TEXT_VAL,
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
                      ...SHORT_TEXT_VAL,
                    }}
                  />
                  <AvField
                    name="jobTitle"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.POSITION,
                      this.selectedLicense
                    )}
                    validate={{
                      ...OPTIONAL_TEXT_VAL,
                    }}
                  />
                  <AvField
                    name="email"
                    label={getAccountInfoTitle(
                      ACCOUNT_TITLES.EMAIL,
                      this.selectedLicense
                    )}
                    type="email"
                    value={this.email}
                    onChange={(event: any) => {
                      this.email = event.target.value;
                    }}
                    validate={EMAIL_VAL}
                  />
                  {this.showEmailMismatchConfirmation ? (
                    <Alert variant={'warning'}>
                      <i className={'mr-2 fa fa-exclamation-triangle'}></i>
                      <span>
                        The entered email address domain does not match any of
                        the company's domains. Please confirm before proceeding.
                      </span>
                    </Alert>
                  ) : null}
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
                </Col>
              </Row>
            )}
            {this.props.visibleSections!.includes(FormSection.COMPANY) && (
              <Row className={getSectionClassName()}>
                <Col md="3">
                  <h5>
                    {getAccountInfoTitle(
                      ACCOUNT_TITLES.COMPANY_SECTION_TITLE,
                      this.selectedLicense
                    )}
                  </h5>
                </Col>
                <Col md="9">
                  {this.props.byAdmin ? (
                    <FormSelectWithLabelField
                      onSelection={(
                        selectedOption: CompanySelectOptionType
                      ) => {
                        this.onSelectCompany(selectedOption);
                      }}
                      labelText={'Select a company to register a user under'}
                      name={'companyDropdown'}
                      options={this.companyOptions}
                      isClearable={true}
                      value={this.selectedCompanyOption}
                    />
                  ) : null}
                  {this.selectedCompanyOption ? null : (
                    <div>
                      {this.selectedLicense !== LicenseType.ACADEMIC && (
                        <p>
                          Please feel free to skip this section if your{' '}
                          {getAccountInfoTitle(
                            ACCOUNT_TITLES.COMPANY,
                            this.selectedLicense
                          ).toLowerCase()}{' '}
                          already has a license with us.
                        </p>
                      )}
                      <AvField
                        name="company"
                        label={getAccountInfoTitle(
                          ACCOUNT_TITLES.COMPANY,
                          this.selectedLicense
                        )}
                        validate={{
                          required: {
                            value: true,
                            errorMessage: 'Your organization name is required.',
                          },
                          ...TEXT_VAL,
                        }}
                      />
                      <AvField
                        name="city"
                        label={getAccountInfoTitle(
                          ACCOUNT_TITLES.CITY,
                          this.selectedLicense
                        )}
                        validate={{
                          required: {
                            value: true,
                            errorMessage:
                              'Please let us know where you located.',
                          },
                          ...TEXT_VAL,
                        }}
                      />
                      <AvField
                        name="country"
                        label={getAccountInfoTitle(
                          ACCOUNT_TITLES.COUNTRY,
                          this.selectedLicense
                        )}
                        validate={{
                          required: {
                            value: true,
                            errorMessage:
                              'Please let us know where you located.',
                          },
                          ...TEXT_VAL,
                        }}
                      />
                      <AvField
                        name={FormKey.COMPANY_DESCRIPTION}
                        label={`${getAccountInfoTitle(
                          ACCOUNT_TITLES.COMPANY,
                          this.selectedLicense
                        )} Description`}
                        type={'textarea'}
                        placeholder={this.companyDescriptionPlaceholder}
                        rows={4}
                        validate={...SLACK_TEXT_VAL}
                      />
                      {this.isCommercialLicense && (
                        <>
                          <AvField
                            name={FormKey.BUS_CONTACT_EMAIL}
                            label={'Business Contact Email'}
                            type="email"
                            validate={{
                              ...EMAIL_VAL,
                              required: {
                                value: false,
                              },
                            }}
                          />
                          <AvField
                            name={FormKey.BUS_CONTACT_PHONE}
                            label={'Business Contact Phone Number'}
                            type="tel"
                          />
                        </>
                      )}
                      <AvField
                        name={FormKey.USE_CASE}
                        label={`Describe how you plan to use ${ONCOKB_TM}`}
                        type={'textarea'}
                        placeholder={this.useCasePlaceholder}
                        rows={6}
                        validate={{
                          ...SLACK_TEXT_VAL,
                          required: {
                            value: true,
                            errorMessage: 'Your use case is required.',
                          },
                        }}
                      />
                      {[LicenseType.COMMERCIAL, LicenseType.HOSPITAL].includes(
                        this.selectedLicense
                      ) && (
                        <AvField
                          name={FormKey.ANTICIPATED_REPORTS}
                          label={
                            'Anticipated # of reports annually for years 1, 2 and 3'
                          }
                          type={'textarea'}
                          placeholder={`If you plan to incorporate ${ONCOKB_TM} contents in sequencing reports, please provide an estimate of your anticipated volume over the next several years`}
                        />
                      )}
                      {[LicenseType.RESEARCH_IN_COMMERCIAL].includes(
                        this.selectedLicense
                      ) && (
                        <AvField
                          name={FormKey.COMPANY_SIZE}
                          label={'Company Size (# of employees)'}
                          type={'input'}
                        />
                      )}
                    </div>
                  )}
                </Col>
              </Row>
            )}
            {!this.isCommercialLicense && (
              <Row className={getSectionClassName()}>
                <Col md="3">
                  <h5>API Access</h5>
                </Col>
                <Col md="9">
                  <p>
                    Would you like programmatic access to the {ONCOKB_TM}{' '}
                    database via our API? API access allows a user to
                    simultaneously annotate multiple tumor mutations with{' '}
                    {ONCOKB_TM} data and provides a text file output.{' '}
                    {ONCOKB_TM} API access may also enable the user to leverage{' '}
                    {ONCOKB_TM} alongside other platform APIs.
                  </p>
                  <p>
                    Should you request API access, you must provide a detailed
                    description on how you plan to use {ONCOKB_TM} APIs.
                    Additional time for user screening will be required to grant
                    access.
                  </p>
                  <p>
                    The following use cases do <b>not</b> require API access:
                  </p>
                  <ul style={{ listStyleType: 'circle' }}>
                    <li>Browse {ONCOKB_TM} content on our website</li>
                    <li>
                      Download data from our website (Actionable Genes,
                      Precision Oncology Therapies, Cancer Genes etc.)
                    </li>
                    <li>
                      View therapeutic implication descriptions (treatment
                      descriptions)
                    </li>
                  </ul>
                  <AvCheckboxGroup
                    name={FormKey.REQUEST_API_ACCESS}
                    key={FormKey.REQUEST_API_ACCESS}
                    errorMessage={'You have to accept the term'}
                  >
                    <AvCheckbox
                      label={'Request API Access'}
                      value={this.apiAccessRequested}
                      onChange={() =>
                        (this.apiAccessRequested = !this.apiAccessRequested)
                      }
                    />
                  </AvCheckboxGroup>
                  {this.apiAccessRequested && (
                    <div className="mt-2">
                      <b style={{ fontSize: '0.8rem', lineHeight: '1' }}>
                        {NOT_USED_IN_AI_MODELS}
                      </b>
                      <AvField
                        name={FormKey.API_ACCESS_JUSTIFICATION}
                        placeholder={
                          'Provide a justification for your API access request'
                        }
                        rows={6}
                        type={'textarea'}
                        required={this.apiAccessRequested}
                        validate={{
                          ...LONG_TEXT_VAL,
                          required: {
                            value: true,
                            errorMessage: 'Your justification is required.',
                          },
                        }}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            )}
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
                    value={this.selectedAccountType}
                    disabled={this.selectedCompanyOption ? true : false}
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
                    <>
                      <div className={'mt-2'}>
                        <AvField
                          name="tokenValidDays"
                          label="Account Expires in Days"
                          required
                          validate={{ number: true }}
                        />
                      </div>
                      <span>
                        A trial license agreement email will be sent to the
                        user.
                      </span>
                    </>
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
