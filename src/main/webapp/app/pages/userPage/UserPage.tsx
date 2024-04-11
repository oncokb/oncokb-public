import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  getAccountInfoTitle,
  getSectionClassName,
} from 'app/pages/account/AccountUtils';
import { ButtonSelections } from 'app/components/LicenseSelection';
import {
  AvCheckbox,
  AvCheckboxGroup,
  AvField,
  AvForm,
  AvRadio,
  AvGroup,
  AvRadioGroup,
} from 'availity-reactstrap-validation';
import {
  ACCOUNT_TITLES,
  AUTHORITIES,
  LicenseType,
  NOT_CHANGEABLE_AUTHORITIES,
  PAGE_ROUTE,
  REDIRECT_TIMEOUT_MILLISECONDS,
  THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT,
  USAGE_ALL_TIME_KEY,
  USAGE_ALL_TIME_VALUE,
  USAGE_DAY_DETAIL_TIME_KEY,
  USAGE_DETAIL_TIME_KEY,
  USER_AUTHORITIES,
} from 'app/config/constants';
import {
  ACCOUNT_TYPE_DEFAULT,
  AccountType,
} from 'app/components/newAccountForm/NewAccountForm';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import {
  AdditionalInfoDTO,
  Token,
  UserDTO,
  UserMailsDTO,
  UserUsage,
  UserCompany,
} from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { DefaultTooltip, remoteData } from 'cbioportal-frontend-commons';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
  toJS,
} from 'mobx';
import { Else, If, Then } from 'react-if';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { RouteComponentProps } from 'react-router';
import autobind from 'autobind-decorator';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { daysDiff, getPageTitle } from 'app/shared/utils/Utils';
import _ from 'lodash';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import TokenInputGroups from 'app/components/tokenInputGroups/TokenInputGroups';
import { EmailTable } from 'app/shared/table/EmailTable';
import { PromiseStatus } from 'app/shared/utils/PromiseUtils';
import { QuickToolButton } from 'app/pages/userPage/QuickToolButton';
import { TrialAccountModal } from './TrialAccountModal';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router-dom';
import { RouterStore } from 'mobx-react-router';
import {
  LONG_TEXT_VAL,
  SHORT_TEXT_VAL,
  TEXT_VAL,
  OPTIONAL_TEXT_VAL,
} from 'app/shared/utils/FormValidationUtils';
import AuthenticationStore from 'app/store/AuthenticationStore';
import ButtonWithTooltip from 'app/shared/button/ButtonWithTooltip';
import {
  ToggleValue,
  UsageRecord,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import UserUsageDetailsTable from 'app/pages/usageAnalysisPage/UserUsageDetailsTable';
import { DateSelector } from 'app/components/dateSelector/DateSelector';
import { KeyInputGroups } from 'app/pages/userPage/KeyInputGroups';
import { Label } from 'reactstrap';
import {
  getAccountActivationLink,
  getPasswordResetLink,
} from 'app/shared/utils/UrlUtils';

export enum AccountStatus {
  ACTIVATED = 'Activated',
  INACTIVATED = 'Inactivated',
}

export enum EmailVerifiedStatus {
  VERIFIED = 'Verified',
  UNVERIFIED = 'Unverified',
}

interface MatchParams {
  login: string;
}

interface IUserPage extends RouteComponentProps<MatchParams> {
  windowStore: WindowStore;
  routing: RouterStore;
  authenticationStore: AuthenticationStore;
}

const BoldAccountTitle: React.FunctionComponent<{
  title: ACCOUNT_TITLES;
  licenseType?: LicenseType;
}> = props => {
  return (
    <span className={'font-bold'}>
      {getAccountInfoTitle(props.title, props.licenseType)}
    </span>
  );
};

enum SimpleConfirmModalType {
  NA,
  DELETE_ACCOUNT,
  INITIATE_TRIAL,
  DELETE_ACTIVATION_KEY,
  DELETE_RESET_KEY,
  GENERATE_RESET_KEY,
}

@inject('windowStore', 'routing', 'authenticationStore')
@observer
export default class UserPage extends React.Component<IUserPage> {
  @observable selectedLicense: LicenseType | undefined;
  @observable selectedAccountType: AccountType | undefined;
  @observable selectedEmailVerifiedStatus: EmailVerifiedStatus | undefined;
  @observable userTokens: Token[] = [];
  @observable user: UserDTO;
  @observable userUsage: UserUsage;
  @observable getUserStatus: PromiseStatus;
  @observable showTrialAccountModal = false;
  @observable showSimpleConfirmModal = false;
  @observable simpleConfirmModalType: SimpleConfirmModalType =
    SimpleConfirmModalType.NA;

  private defaultPageSize = 5;

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: IUserPage) {
    super(props);
    this.reactions.push(
      reaction(
        () => this.defaultSelectedAccountType,
        newDefault => {
          this.selectedAccountType = newDefault;
        },
        true
      )
    );
    this.reactions.push(
      reaction(
        () => this.simpleConfirmModalType,
        newDefault => {
          this.showSimpleConfirmModal =
            newDefault !== SimpleConfirmModalType.NA;
        },
        false
      )
    );
    this.getUser();
    this.getUserTokens();
  }

  componentWillUnmount() {
    this.reactions.forEach(disposer => disposer());
  }

  readonly usageDetail = remoteData<Map<string, UsageRecord[]>>({
    await: () => [],
    invoke: async () => {
      this.userUsage = await client.userUsageGetUsingGET({
        userId: this.user.id,
      });
      const result = new Map<string, UsageRecord[]>();
      if (this.userUsage.summary !== null) {
        const yearSummary = this.userUsage.summary.year;
        const yearUsage: UsageRecord[] = [];
        Object.keys(yearSummary).forEach(resourceEntry => {
          yearUsage.push({
            resource: resourceEntry,
            usage: yearSummary[resourceEntry],
            time: USAGE_ALL_TIME_VALUE,
          });
        });
        result.set(USAGE_ALL_TIME_KEY, yearUsage);

        const monthSummary = this.userUsage.summary.month;
        const detailSummary: UsageRecord[] = [];
        Object.keys(monthSummary).forEach(month => {
          const monthUsage = monthSummary[month];
          Object.keys(monthUsage).forEach(resourceEntry => {
            detailSummary.push({
              resource: resourceEntry,
              usage: monthUsage[resourceEntry],
              time: month,
            });
          });
        });
        result.set(USAGE_DETAIL_TIME_KEY, detailSummary);

        const daySummary = this.userUsage.summary.day;
        const dayDetailSummary: UsageRecord[] = [];
        Object.keys(daySummary).forEach(day => {
          const dayUsage = daySummary[day];
          Object.keys(dayUsage).forEach(resourceEntry => {
            dayDetailSummary.push({
              resource: resourceEntry,
              usage: dayUsage[resourceEntry],
              time: day,
            });
          });
        });
        result.set(USAGE_DAY_DETAIL_TIME_KEY, dayDetailSummary);
      }
      return Promise.resolve(result);
    },
    default: new Map(),
  });

  readonly usersUserMails = remoteData<UserMailsDTO[]>({
    invoke: () => {
      return client.getUsersUserMailsUsingGET({
        login: this.props.match.params.login,
      });
    },
    default: [],
  });

  @action
  async getUserTokens() {
    this.userTokens = await client.getUserTokensUsingGET({
      login: this.props.match.params.login,
    });
  }

  @computed
  get defaultSelectedAccountType() {
    return this.isTrialAccount ? AccountType.TRIAL : AccountType.REGULAR;
  }

  @computed
  get defaultSelectedEmailVerifiedStatus() {
    return this.user.emailVerified
      ? EmailVerifiedStatus.VERIFIED
      : EmailVerifiedStatus.UNVERIFIED;
  }

  @computed
  get shortestToken() {
    const tokens = _.sortBy(this.userTokens, token =>
      daysDiff(token.expiration)
    );
    return tokens.length > 0 ? tokens[0] : undefined;
  }

  @action.bound
  addNewToken() {
    this.props.authenticationStore
      .generateIdToken()
      .then((token: Token) => {
        this.getUserTokens();
        notifySuccess('New token created.');
      })
      .catch(error => {
        notifyError(error, 'Error generating token.');
      });
  }

  @action.bound
  deleteToken(token: Token) {
    client
      .deleteTokenUsingDELETE({ token })
      .then(() => {
        this.getUserTokens();
        notifySuccess('Token is deleted');
      })
      .catch((error: Error) => {
        notifyError(error);
      });
  }

  @autobind
  @action
  changeTokenExpirationDate(
    token: Token,
    newDate: string,
    notifyOnSuccess = true
  ) {
    client
      .updateTokenUsingPUT({
        token: {
          ...token,
          expiration: newDate,
        },
      })
      .then(
        () => {
          if (notifyOnSuccess) notifySuccess('Updated Token');
          this.getUserTokens();
        },
        (error: Error) => {
          notifyError(error);
        }
      );
  }

  @autobind
  @action
  extendTrialAccess(newDate: string) {
    Promise.all(
      this.userTokens.map(token => {
        this.changeTokenExpirationDate(token, newDate, false);
      })
    ).then(
      () => notifySuccess(`Trial ended to ${newDate}`),
      error => notifyError(error)
    );
  }

  @autobind
  updateUserUsingPUT(updatedUser: UserDTO, tokenValidDays?: number) {
    client
      .updateUserUsingPUT({
        userDto: updatedUser,
        sendEmail: false,
        unlinkUser: false,
      })
      .then(
        (updatedUserDTO: UserDTO) => {
          const tokenIsRenewable =
            this.selectedAccountType !== AccountType.TRIAL;
          let updatedTokenValidDays: number | undefined;
          if (tokenValidDays) {
            updatedTokenValidDays = Number(tokenValidDays);
          }
          notifySuccess('Updated User');
          this.user = updatedUserDTO;
          this.getUserStatus = PromiseStatus.complete;
          client
            .getUserTokensUsingGET({
              login: updatedUserDTO.login,
            })
            .then(
              tokens => {
                this.userTokens = tokens;
                tokens.forEach(token => {
                  if (
                    token.renewable !== tokenIsRenewable ||
                    updatedTokenValidDays !== undefined
                  ) {
                    const now = new Date(Date.now());
                    if (updatedTokenValidDays) {
                      now.setDate(now.getDate() + updatedTokenValidDays);
                    }
                    client
                      .updateTokenUsingPUT({
                        token: {
                          ...token,
                          renewable: tokenIsRenewable,
                          expiration: tokenValidDays
                            ? now.toISOString()
                            : token.expiration,
                        },
                      })
                      .then(
                        () => {
                          notifySuccess('Updated Token');
                        },
                        (error: Error) => {
                          this.getUserStatus = PromiseStatus.error;
                          notifyError(error);
                        }
                      );
                  }
                });
              },
              (error: Error) => {
                this.getUserStatus = PromiseStatus.error;
                notifyError(error);
              }
            );
        },
        (error: Error) => {
          this.getUserStatus = PromiseStatus.error;
          notifyError(error);
        }
      );
  }

  @autobind
  @action
  updateUser(event: any, values: any) {
    if (this.user) {
      const updatedUserCompany: UserCompany = {
        ...this.user.additionalInfo?.userCompany,
        useCase: values.additionalInfoUseCase,
      };
      const updatedAdditionalInfo: AdditionalInfoDTO = {
        ...this.user.additionalInfo,
        userCompany: updatedUserCompany,
      };
      if (!values.authorities.includes(AUTHORITIES.API)) {
        updatedAdditionalInfo.apiAccessRequest = {
          requested: false,
          justification: '',
        };
      }

      const updatedUser: UserDTO = {
        ...this.user,
        firstName: values.firstName,
        lastName: values.lastName,
        licenseType: this.selectedLicense
          ? this.selectedLicense
          : this.user.licenseType,
        authorities: values.authorities,
        activated: values.accountStatus === AccountStatus.ACTIVATED,
        jobTitle: values.jobTitle,
        resetDate: values.resetDate,
        companyName: this.user.company
          ? this.user.company.name
          : values.company,
        additionalInfo: updatedAdditionalInfo,
        city: values.city,
        country: values.country,
      };
      this.getUserStatus = PromiseStatus.pending;
      this.updateUserUsingPUT(updatedUser, values.tokenValidDays);
    }
  }

  @action
  getUser() {
    this.getUserStatus = PromiseStatus.pending;
    client
      .getUserUsingGET({
        login: this.props.match.params.login,
      })
      .then(
        user => {
          this.user = user;
          if (this.user) {
            this.selectedLicense = this.user.licenseType as LicenseType;
          }
          this.getUserStatus = PromiseStatus.complete;
        },
        (error: Error) => {
          this.getUserStatus = PromiseStatus.error;
          notifyError(error);
        }
      );
  }

  @autobind
  @action
  generateResetKey() {
    client
      .generateResetKeyUsingPOST({
        login: this.props.match.params.login,
      })
      .then(
        updatedUser => {
          this.user = updatedUser;
          notifySuccess('Updated User');
        },
        (error: Error) => notifyError(error)
      );
  }

  @autobind
  @action
  generateTrialActivationKey() {
    client
      .initiateTrialAccountActivationUsingPOST({
        login: this.user.login,
      })
      .then(
        updatedUser => {
          this.user = updatedUser;
          notifySuccess('Initiated trial account');
          this.showTrialAccountModal = true;
        },
        (error: Error) => notifyError(error)
      );
  }

  @autobind
  onClickTrialAccountButton() {
    if (this.trialInitiated) {
      this.showTrialAccountModal = true;
    } else {
      this.simpleConfirmModalType = SimpleConfirmModalType.INITIATE_TRIAL;
    }
  }

  @autobind
  onConfirmSimpleConfirmModal() {
    switch (this.simpleConfirmModalType) {
      case SimpleConfirmModalType.INITIATE_TRIAL:
        this.onConfirmInitiateTrialAccountButton();
        break;
      case SimpleConfirmModalType.DELETE_ACCOUNT:
        this.onConfirmDeleteAccountButton();
        break;
      case SimpleConfirmModalType.DELETE_ACTIVATION_KEY:
        delete this.user.activationKey;
        this.updateUserUsingPUT(this.user);
        break;
      case SimpleConfirmModalType.DELETE_RESET_KEY:
        delete this.user.resetKey;
        delete this.user.resetDate;
        this.updateUserUsingPUT(this.user);
        break;
      case SimpleConfirmModalType.GENERATE_RESET_KEY:
        this.generateResetKey();
        break;
      case SimpleConfirmModalType.NA:
      default:
        break;
    }
    this.simpleConfirmModalType = SimpleConfirmModalType.NA;
  }

  @autobind
  onConfirmInitiateTrialAccountButton() {
    this.generateTrialActivationKey();
  }

  @autobind
  onConfirmDeleteAccountButton() {
    client.deleteUserUsingDELETE({ login: this.user.login }).then(
      deletedUser => {
        notifySuccess(
          'Deleted account, we will redirect you to the users page.'
        );
        setTimeout(() => {
          this.props.routing.history.push(PAGE_ROUTE.ADMIN_USER_DETAILS);
        }, REDIRECT_TIMEOUT_MILLISECONDS);
      },
      (error: Error) => notifyError(error)
    );
  }

  @computed
  get isTrialAccount() {
    return (
      this.userTokens.length > 0 &&
      this.userTokens.filter(token => token.renewable).length < 1
    );
  }

  @computed
  get trialInitiated() {
    return !!this.user.additionalInfo?.trialAccount?.activation?.initiationDate;
  }

  @computed
  get trialAccountButtonText() {
    return this.trialInitiated
      ? 'Show Trial Activation Info'
      : 'Generate Trial Activation Link';
  }

  generateActivationKeyInfoOverlay() {
    return (
      <>
        <b>Account Activation Link</b>
        <div>
          {this.props.windowStore.baseUrl}
          {getAccountActivationLink(this.user.activationKey, this.user.login)}
        </div>
      </>
    );
  }

  generateResetKeyInfoOverlay() {
    return (
      <>
        <b>Password Reset Link</b>
        <div>
          {this.props.windowStore.baseUrl}
          {getPasswordResetLink(this.user.resetKey)}
        </div>
      </>
    );
  }

  render() {
    return (
      <If condition={this.getUserStatus === PromiseStatus.pending}>
        <Then>
          <LoadingIndicator isLoading={true} />
        </Then>
        <Else>
          <If condition={this.getUserStatus === PromiseStatus.error}>
            <Then>
              <Alert variant={'danger'}>Error loading user information</Alert>
            </Then>
            <Else>
              {this.user !== undefined && (
                <DocumentTitle
                  title={getPageTitle(
                    `${this.user.firstName} ${this.user.lastName}`
                  )}
                >
                  <AvForm onValidSubmit={this.updateUser} model={this.user}>
                    <div>
                      <Row className={getSectionClassName()}>
                        <Col>
                          <div>Quick Tools</div>
                          <div>
                            <QuickToolButton
                              onClick={this.onClickTrialAccountButton}
                            >
                              {this.trialAccountButtonText}
                            </QuickToolButton>
                            {this.isTrialAccount && this.shortestToken && (
                              <DefaultTooltip
                                overlay={
                                  <DateSelector
                                    currentDate={this.shortestToken.expiration}
                                    afterChangeDate={this.extendTrialAccess}
                                  />
                                }
                              >
                                <QuickToolButton>
                                  Extend Trial Access
                                </QuickToolButton>
                              </DefaultTooltip>
                            )}
                            <QuickToolButton
                              onClick={() =>
                                this.props.routing.history.push(
                                  `${PAGE_ROUTE.ADMIN_SEND_EMAILS}?to=${this.user.email}`
                                )
                              }
                            >
                              Send Email
                            </QuickToolButton>
                            {this.user.additionalInfo?.trialAccount ? (
                              <TrialAccountModal
                                baseUrl={this.props.windowStore.baseUrl}
                                trialAccount={
                                  this.user.additionalInfo?.trialAccount
                                }
                                show={this.showTrialAccountModal}
                                onClose={() =>
                                  (this.showTrialAccountModal = false)
                                }
                              />
                            ) : null}
                          </div>
                        </Col>
                      </Row>
                      <Row className={getSectionClassName()}>
                        <Col>
                          <AvField
                            name="id"
                            value={this.user.id}
                            label={
                              <BoldAccountTitle title={ACCOUNT_TITLES.ID} />
                            }
                            disabled
                          />
                          <AvField
                            name="email"
                            value={this.user.email}
                            label={
                              <BoldAccountTitle
                                title={ACCOUNT_TITLES.EMAIL}
                                licenseType={this.selectedLicense}
                              />
                            }
                            disabled
                          />
                          <AvGroup>
                            <div className={'mb-2 font-bold'}>
                              Email Verified
                            </div>
                            <AvRadioGroup
                              inline
                              name="emailVerified"
                              label=""
                              value={this.defaultSelectedEmailVerifiedStatus}
                              onChange={(event: any, value: any) => {
                                if (value) {
                                  this.selectedEmailVerifiedStatus = value;
                                } else {
                                  this.selectedEmailVerifiedStatus = this.defaultSelectedEmailVerifiedStatus;
                                }
                              }}
                              required
                            >
                              <AvRadio
                                label={EmailVerifiedStatus.VERIFIED}
                                value={EmailVerifiedStatus.VERIFIED}
                              />
                              <AvRadio
                                label={EmailVerifiedStatus.UNVERIFIED}
                                value={EmailVerifiedStatus.UNVERIFIED}
                                disabled={this.user.emailVerified}
                              />
                            </AvRadioGroup>
                          </AvGroup>
                          <AvField
                            name="firstName"
                            label={
                              <BoldAccountTitle
                                title={ACCOUNT_TITLES.FIRST_NAME}
                                licenseType={this.selectedLicense}
                              />
                            }
                            value={this.user.firstName}
                            validate={{
                              required: {
                                value: true,
                                errorMessage: 'First name is required',
                              },
                              ...SHORT_TEXT_VAL,
                            }}
                          />
                          <AvField
                            name="lastName"
                            label={
                              <BoldAccountTitle
                                title={ACCOUNT_TITLES.LAST_NAME}
                                licenseType={this.selectedLicense}
                              />
                            }
                            value={this.user.lastName}
                            validate={{
                              required: {
                                value: true,
                                errorMessage: 'Last name is required',
                              },
                              ...SHORT_TEXT_VAL,
                            }}
                          />
                          <AvField
                            name="createdDate"
                            label={<b>Created Date</b>}
                            value={this.user.createdDate}
                            disabled
                          />
                          <AvField
                            name="lastModifiedBy"
                            label={<b>Last Modified By</b>}
                            value={this.user.lastModifiedBy}
                            disabled
                          />
                          <AvField
                            name="lastModifiedDate"
                            label={<b>Last Modified Date</b>}
                            value={this.user.lastModifiedDate}
                            disabled
                          />
                          <Label>
                            <b>Activation Key</b>
                          </Label>
                          <KeyInputGroups
                            keyVal={this.user.activationKey}
                            infoOverlay={this.generateActivationKeyInfoOverlay()}
                            onDelete={() => {
                              this.simpleConfirmModalType =
                                SimpleConfirmModalType.DELETE_ACTIVATION_KEY;
                            }}
                          />
                          <Label>
                            <b>Reset Key</b>
                          </Label>
                          <KeyInputGroups
                            keyVal={this.user.resetKey}
                            infoOverlay={this.generateResetKeyInfoOverlay()}
                            onCreate={() => {
                              this.simpleConfirmModalType =
                                SimpleConfirmModalType.GENERATE_RESET_KEY;
                            }}
                            onDelete={() => {
                              this.simpleConfirmModalType =
                                SimpleConfirmModalType.DELETE_RESET_KEY;
                            }}
                          />
                          <AvField
                            name="resetDate"
                            label={<b>Reset Date</b>}
                            value={this.user.resetDate || ''}
                            disabled
                          />
                        </Col>
                      </Row>
                      <Row className={getSectionClassName(false)}>
                        <Col>
                          <TokenInputGroups
                            changeTokenExpirationDate={true}
                            tokens={this.userTokens}
                            onDeleteToken={this.deleteToken}
                            extendExpirationDate={
                              this.changeTokenExpirationDate
                            }
                          />
                          <div className="mt-2 d-flex flex-row-reverse">
                            <ButtonWithTooltip
                              tooltipProps={{
                                placement: 'top',
                                overlay:
                                  this.userTokens.length > 1
                                    ? 'Cannot generate token when there is more than one token associated with user.'
                                    : "Create new token. User's old token will expire in 7 days if expiration is longer than 7 days.",
                              }}
                              buttonProps={{
                                variant: 'primary',
                                size: 'sm',
                                onClick: () => this.addNewToken(),
                                disabled: this.userTokens.length > 1,
                              }}
                              buttonContent={'New Token'}
                            />
                          </div>
                        </Col>
                      </Row>
                      <Row className={getSectionClassName(false)}>
                        <Col>
                          <div>
                            <div className={'mb-2 mt-1 font-weight-bold'}>
                              <span className={'font-bold'}>License Type</span>
                              {!this.user.company ? null : (
                                <InfoIcon
                                  className={'ml-2'}
                                  overlay={`User is associated with a company. The license type should match with the company's license.`}
                                />
                              )}
                            </div>
                            <If condition={!!this.user.company}>
                              <Then>
                                <AvField
                                  name="selectedLicense"
                                  value={this.selectedLicense}
                                  disabled
                                />
                              </Then>
                              <Else>
                                <ButtonSelections
                                  isLargeScreen={
                                    this.props.windowStore.isLargeScreen
                                  }
                                  selectedButton={
                                    this.selectedLicense as LicenseType
                                  }
                                  onSelectLicense={selectedLicense =>
                                    (this.selectedLicense = selectedLicense)
                                  }
                                />
                              </Else>
                            </If>
                          </div>
                          <AvField
                            name="jobTitle"
                            label={
                              <BoldAccountTitle
                                title={ACCOUNT_TITLES.POSITION}
                                licenseType={this.selectedLicense}
                              />
                            }
                            validate={OPTIONAL_TEXT_VAL}
                            value={this.user.jobTitle}
                          />
                          <AvField
                            name="company"
                            label={
                              <>
                                <BoldAccountTitle
                                  title={ACCOUNT_TITLES.COMPANY}
                                  licenseType={this.selectedLicense}
                                />
                                {this.user.company ? (
                                  <Link
                                    to={`/companies/${this.user.company.id}`}
                                  >
                                    <i className="ml-2 fa fa-pencil-square-o" />
                                  </Link>
                                ) : null}
                              </>
                            }
                            validate={TEXT_VAL}
                            value={
                              this.user.company
                                ? this.user.company.name
                                : this.user.companyName
                            }
                            disabled={this.user.company != null}
                          />
                          <AvField
                            name="additionalInfoUseCase"
                            label={
                              <BoldAccountTitle
                                title={ACCOUNT_TITLES.ADDITIONAL_INFO_USE_CASE}
                                licenseType={this.selectedLicense}
                              />
                            }
                            value={
                              this.user.additionalInfo?.userCompany?.useCase
                            }
                            rows={3}
                            type={'textarea'}
                            validate={LONG_TEXT_VAL}
                          />
                          <AvField
                            name="city"
                            label={
                              <BoldAccountTitle
                                title={ACCOUNT_TITLES.CITY}
                                licenseType={this.selectedLicense}
                              />
                            }
                            value={this.user.city}
                            validate={TEXT_VAL}
                          />
                          <AvField
                            name="country"
                            label={
                              <BoldAccountTitle
                                title={ACCOUNT_TITLES.COUNTRY}
                                licenseType={this.selectedLicense}
                              />
                            }
                            value={this.user.country}
                            validate={TEXT_VAL}
                          />
                          <div className={'mb-2 font-weight-bold'}>
                            Account Type
                          </div>
                          <AvRadioGroup
                            inline
                            name="accountType"
                            label=""
                            required
                            value={this.defaultSelectedAccountType}
                            onChange={(event: any, value: any) => {
                              if (value) {
                                this.selectedAccountType = value;
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
                                label={<b>Account Expires in Days</b>}
                                required
                                value={
                                  this.shortestToken
                                    ? daysDiff(this.shortestToken.expiration)
                                    : THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT
                                }
                                validate={{ number: true }}
                              />
                            </div>
                          ) : null}
                          <div className={'mb-2 mt-1 font-weight-bold'}>
                            <span>Account Status</span>
                            <InfoIcon
                              className={'ml-2'}
                              overlay={
                                'Update here will not notify user. If you want to notify user, please update user status in the users table'
                              }
                            />
                          </div>
                          <AvRadioGroup
                            inline
                            name="accountStatus"
                            label=""
                            required
                            value={
                              this.user.activated
                                ? AccountStatus.ACTIVATED
                                : AccountStatus.INACTIVATED
                            }
                          >
                            <AvRadio
                              label={AccountStatus.ACTIVATED}
                              value={AccountStatus.ACTIVATED}
                            />
                            <AvRadio
                              label={AccountStatus.INACTIVATED}
                              value={AccountStatus.INACTIVATED}
                            />
                          </AvRadioGroup>
                          <div className={'my-2 font-weight-bold'}>
                            User Authorities
                          </div>
                          <AvCheckboxGroup
                            inline
                            name="authorities"
                            label=""
                            value={toJS(this.user.authorities)}
                            required
                          >
                            {USER_AUTHORITIES.map(authority => (
                              <AvCheckbox
                                key={authority}
                                label={authority}
                                value={authority}
                                disabled={NOT_CHANGEABLE_AUTHORITIES.includes(
                                  authority
                                )}
                              />
                            ))}
                          </AvCheckboxGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col className={getSectionClassName()}>
                          <Button
                            id="update-user"
                            variant="primary"
                            type="submit"
                          >
                            Update
                          </Button>
                        </Col>
                      </Row>
                      <Row>
                        <Col className={getSectionClassName()}>
                          <div className={'my-2 font-weight-bold'}>
                            Data usage
                          </div>
                          <UserUsageDetailsTable
                            data={this.usageDetail.result}
                            loadedData={this.usageDetail.isComplete}
                            defaultResourcesType={ToggleValue.CUMULATIVE_USAGE}
                            defaultTimeType={ToggleValue.RESULTS_BY_MONTH}
                            defaultPageSize={this.defaultPageSize}
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col className={getSectionClassName()}>
                          <div className={'my-2 font-weight-bold'}>
                            Email history
                          </div>
                          <EmailTable
                            data={this.usersUserMails.result}
                            defaultPageSize={this.defaultPageSize}
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col className={getSectionClassName()}>
                          <div className={'my-2 text-danger'}>Danger Zone</div>
                          <div>
                            <Button
                              variant="danger"
                              onClick={() => {
                                this.simpleConfirmModalType =
                                  SimpleConfirmModalType.DELETE_ACCOUNT;
                              }}
                            >
                              Delete Account
                            </Button>
                            <SimpleConfirmModal
                              key={'user-page-simple-confirm-modal'}
                              show={this.showSimpleConfirmModal}
                              onCancel={() =>
                                (this.simpleConfirmModalType =
                                  SimpleConfirmModalType.NA)
                              }
                              onConfirm={this.onConfirmSimpleConfirmModal}
                            />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </AvForm>
                </DocumentTitle>
              )}
            </Else>
          </If>
        </Else>
      </If>
    );
  }
}
