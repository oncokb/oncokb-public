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
  AvRadioGroup,
} from 'availity-reactstrap-validation';
import {
  ACCOUNT_TITLES,
  LicenseType,
  NOT_CHANGEABLE_AUTHORITIES,
  THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT,
  USER_AUTHORITIES,
  XREGEXP_VALID_LATIN_TEXT,
} from 'app/config/constants';
import XRegExp from 'xregexp';
import {
  ACCOUNT_TYPE_DEFAULT,
  AccountType,
} from 'app/components/newAccountForm/NewAccountForm';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import { Token, UserDTO, UserMailsDTO } from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { remoteData, getBrowserWindow } from 'cbioportal-frontend-commons';
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
import { daysDiff } from 'app/shared/utils/Utils';
import _ from 'lodash';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import TokenInputGroups from 'app/components/tokenInputGroups/TokenInputGroups';
import { EmailTable } from 'app/shared/table/EmailTable';
import { PromiseStatus } from 'app/shared/utils/PromiseUtils';
import { QuickToolButton } from 'app/pages/userPage/QuickToolButton';
import { TrialAccountModal } from './TrialAccountModal';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';

export enum AccountStatus {
  ACTIVATED = 'Activated',
  INACTIVATED = 'Inactivated',
}

interface MatchParams {
  login: string;
}

interface IUserPage extends RouteComponentProps<MatchParams> {
  windowStore: WindowStore;
}

const BoldAccountTitle: React.FunctionComponent<{
  title: ACCOUNT_TITLES;
  licenseType: LicenseType | undefined;
}> = props => {
  return (
    <span className={'font-weight-bold'}>
      {getAccountInfoTitle(props.title, props.licenseType)}
    </span>
  );
};
@inject('windowStore')
@observer
export default class UserPage extends React.Component<IUserPage> {
  @observable selectedLicense: LicenseType | undefined;
  @observable selectedAccountType: AccountType | undefined;
  @observable userTokens: Token[] = [];
  @observable user: UserDTO;
  @observable getUserStatus: PromiseStatus;
  @observable showTrialAccountModal = false;
  @observable showTrialAccountConfirmModal = false;

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: IUserPage) {
    super(props);
    this.reactions.push(
      reaction(
        () => this.defaultSelectedAccountType,
        newDefault => {
          if (this.selectedAccountType === undefined) {
            this.selectedAccountType = newDefault;
          }
        },
        true
      )
    );
    this.getUser();
    this.getUserTokens();
  }

  componentWillUnmount() {
    this.reactions.forEach(disposer => disposer());
  }

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
    const currentlyIsTrialAccount =
      this.userTokens.filter(token => !token.renewable).length > 0;
    return currentlyIsTrialAccount ? AccountType.TRIAL : AccountType.REGULAR;
  }

  @computed
  get shortestToken() {
    const tokens = _.sortBy(this.userTokens, token =>
      daysDiff(token.expiration)
    );
    return tokens.length > 0 ? tokens[0] : undefined;
  }

  @action
  deleteToken(token: Token) {
    client
      .deleteTokenUsingDELETE({ token })
      .then(() => {
        notifySuccess('Token is deleted');
      })
      .catch((error: Error) => {
        notifyError(error);
      });
  }

  @autobind
  @action
  extendExpirationDate(token: Token, newDate: string) {
    client
      .updateTokenUsingPUT({
        token: {
          ...token,
          expiration: newDate,
        },
      })
      .then(
        () => {
          notifySuccess('Updated Token');
          this.getUserTokens();
        },
        (error: Error) => {
          notifyError(error);
        }
      );
  }

  @autobind
  @action
  updateUser(event: any, values: any) {
    if (this.user) {
      const updatedUser: UserDTO = {
        ...this.user,
        licenseType: this.selectedLicense
          ? this.selectedLicense
          : this.user.licenseType,
        authorities: values.authorities,
        activated: values.accountStatus === AccountStatus.ACTIVATED,
        jobTitle: values.jobTitle,
        company: values.company,
        city: values.city,
        country: values.country,
      };
      this.getUserStatus = PromiseStatus.pending;
      client
        .updateUserUsingPUT({
          userDto: updatedUser,
          sendEmail: false,
        })
        .then(
          (updatedUserDTO: UserDTO) => {
            const tokenIsRenewable =
              this.selectedAccountType !== AccountType.TRIAL;
            let tokenValidDays: number | undefined;
            if (values.tokenValidDays) {
              tokenValidDays = Number(values.tokenValidDays);
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
                  tokens.forEach(token => {
                    if (
                      token.renewable !== tokenIsRenewable ||
                      tokenValidDays !== undefined
                    ) {
                      const now = new Date(Date.now());
                      if (tokenValidDays) {
                        now.setDate(now.getDate() + tokenValidDays);
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
                            notifyError(error);
                          }
                        );
                    }
                  });
                },
                (error: Error) => {
                  notifyError(error);
                }
              );
          },
          (error: Error) => {
            notifyError(error);
          }
        );
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
        mail: this.props.match.params.login,
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
        mail: this.user.email,
      })
      .then(
        updatedUser => {
          this.user = updatedUser;
          notifySuccess('Initiated trial account');
        },
        (error: Error) => notifyError(error)
      );
  }

  @autobind
  onClickTrialAccountButton() {
    if (this.hasTrialAccountInfo) {
      this.showTrialAccountModal = true;
    } else {
      this.showTrialAccountConfirmModal = true;
    }
  }

  @autobind
  onConfirmInitiateTrialAccountButton() {
    this.showTrialAccountConfirmModal = false;
    this.generateTrialActivationKey();
  }

  @computed
  get hasTrialAccountInfo() {
    return !!this.user.additionalInfo?.trialAccount?.activation?.initiationDate;
  }

  @computed
  get trialAccountButtonText() {
    return this.hasTrialAccountInfo
      ? 'Show Trial Activation Info'
      : 'Generate Trial Activation Link';
  }

  render() {
    return (
      <If condition={this.getUserStatus === PromiseStatus.pending}>
        <Then>
          <LoadingIndicator isLoading={true}>
            Loading user information
          </LoadingIndicator>
        </Then>
        <Else>
          <If condition={this.getUserStatus === PromiseStatus.error}>
            <Then>
              <Alert variant={'danger'}>Error loading user information</Alert>
            </Then>
            <Else>
              {this.user !== undefined && (
                <AvForm onValidSubmit={this.updateUser}>
                  <div>
                    <Row className={getSectionClassName()}>
                      <Col>
                        <div>Quick Tools</div>
                        <div>
                          <QuickToolButton onClick={this.generateResetKey}>
                            Generate Reset Key
                          </QuickToolButton>
                          <QuickToolButton
                            onClick={this.onClickTrialAccountButton}
                          >
                            {this.trialAccountButtonText}
                          </QuickToolButton>
                          <SimpleConfirmModal
                            show={this.showTrialAccountConfirmModal}
                            onCancel={() =>
                              (this.showTrialAccountConfirmModal = false)
                            }
                            onConfirm={this.onConfirmInitiateTrialAccountButton}
                          />
                          <TrialAccountModal
                            baseUrl={this.props.windowStore.baseUrl}
                            trialAccount={
                              this.user.additionalInfo?.trialAccount
                            }
                            show={this.showTrialAccountModal}
                            onClose={() => (this.showTrialAccountModal = false)}
                            onRegenerate={this.generateTrialActivationKey}
                          />
                        </div>
                      </Col>
                    </Row>
                    <Row className={getSectionClassName()}>
                      <Col>
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
                        <AvField
                          name="firstName"
                          label={
                            <BoldAccountTitle
                              title={ACCOUNT_TITLES.FIRST_NAME}
                              licenseType={this.selectedLicense}
                            />
                          }
                          value={this.user.firstName}
                          disabled
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
                          disabled
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
                        <AvField
                          name="activationKey"
                          label={<b>Activation Key</b>}
                          value={this.user.activationKey}
                          disabled
                        />
                        <AvField
                          name="resetKey"
                          label={<b>Reset Key</b>}
                          value={this.user.resetKey}
                          disabled
                        />
                        <AvField
                          name="resetDate"
                          label={<b>Reset Date</b>}
                          value={this.user.resetDate}
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
                          extendExpirationDate={this.extendExpirationDate}
                        />
                      </Col>
                    </Row>
                    <Row className={getSectionClassName(false)}>
                      <Col>
                        <ButtonSelections
                          isLargeScreen={this.props.windowStore.isLargeScreen}
                          selectedButton={this.selectedLicense as LicenseType}
                          onSelectLicense={selectedLicense =>
                            (this.selectedLicense = selectedLicense)
                          }
                        />
                        <AvField
                          name="jobTitle"
                          label={
                            <BoldAccountTitle
                              title={ACCOUNT_TITLES.POSITION}
                              licenseType={this.selectedLicense}
                            />
                          }
                          validate={{
                            minLength: {
                              value: 1,
                              errorMessage:
                                'Required to be at least 1 character',
                            },
                            pattern: {
                              value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
                              errorMessage:
                                'Sorry, we only support Latin letters for now.',
                            },
                            maxLength: {
                              value: 50,
                              errorMessage:
                                'Cannot be longer than 50 characters',
                            },
                          }}
                          value={this.user.jobTitle}
                        />
                        <AvField
                          name="company"
                          label={
                            <BoldAccountTitle
                              title={ACCOUNT_TITLES.COMPANY}
                              licenseType={this.selectedLicense}
                            />
                          }
                          validate={{
                            minLength: {
                              value: 1,
                              errorMessage:
                                'Required to be at least 1 character',
                            },
                            pattern: {
                              value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
                              errorMessage:
                                'Sorry, we only support Latin letters for now.',
                            },
                            maxLength: {
                              value: 50,
                              errorMessage:
                                'Cannot be longer than 50 characters',
                            },
                          }}
                          value={this.user.company}
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
                          validate={{
                            minLength: {
                              value: 1,
                              errorMessage:
                                'Required to be at least 1 character',
                            },
                            pattern: {
                              value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
                              errorMessage:
                                'Sorry, we only support Latin letters for now.',
                            },
                            maxLength: {
                              value: 50,
                              errorMessage:
                                'Cannot be longer than 50 characters',
                            },
                          }}
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
                          validate={{
                            pattern: {
                              value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
                              errorMessage:
                                'Sorry, we only support Latin letters for now.',
                            },
                            minLength: {
                              value: 1,
                              errorMessage:
                                'Required to be at least 1 character',
                            },
                            maxLength: {
                              value: 50,
                              errorMessage:
                                'Cannot be longer than 50 characters',
                            },
                          }}
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
                          Email history
                        </div>
                        <EmailTable data={this.usersUserMails.result} />
                      </Col>
                    </Row>
                  </div>
                </AvForm>
              )}
            </Else>
          </If>
        </Else>
      </If>
    );
  }
}
