import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  getAccountInfoTitle,
  getSectionClassName,
} from 'app/pages/account/AccountUtils';
import { ButtonSelections } from 'app/components/LicenseSelection';
import {
  AvField,
  AvForm,
  AvRadio,
  AvRadioGroup,
  AvCheckboxGroup,
  AvCheckbox,
} from 'availity-reactstrap-validation';
import {
  ACCOUNT_TITLES,
  LicenseType,
  NOT_CHANGEABLE_AUTHORITIES,
  THRESHOLD_TRIAL_TOKEN_VALID_DEFAULT,
  UNAUTHORIZED_ALLOWED_PATH,
  USER_AUTHORITIES,
  USER_AUTHORITY,
  XREGEXP_VALID_LATIN_TEXT,
} from 'app/config/constants';
import XRegExp from 'xregexp';
import {
  ACCOUNT_TYPE_DEFAULT,
  AccountType,
} from 'app/components/newAccountForm/NewAccountForm';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import {
  ManagedUserVM,
  Token,
  UserDTO,
  UserMailsDTO,
} from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
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

  constructor(props: IUserPage) {
    super(props);
  }

  readonly user = remoteData<UserDTO>({
    invoke: () => {
      return client.getUserUsingGET({
        login: this.props.match.params.login,
      });
    },
    onResult: user => {
      if (user) {
        this.selectedLicense = user.licenseType as LicenseType;
      }
    },
  });

  readonly tokens = remoteData<Token[]>({
    invoke: () => {
      return client.getUserTokensUsingGET({
        login: this.props.match.params.login,
      });
    },
    default: [],
    onResult: tokens => {
      if (this.selectedAccountType === undefined) {
        const currentlyIsTrialAccount =
          this.tokens.result.filter(token => !token.renewable).length > 0;
        this.selectedAccountType = currentlyIsTrialAccount
          ? AccountType.TRIAL
          : AccountType.REGULAR;
      }
    },
  });

  readonly usersUserMails = remoteData<UserMailsDTO[]>({
    invoke: () => {
      return client.getUsersUserMailsUsingGET({
        login: this.props.match.params.login,
      });
    },
    default: [],
  });

  @computed
  get shortestToken() {
    const tokens = _.sortBy(this.tokens.result, token =>
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
        },
        (error: Error) => {
          notifyError(error);
        }
      );
  }

  @autobind
  @action
  updateUser(event: any, values: any) {
    if (this.user.result) {
      const updatedUser: UserDTO = {
        ...this.user.result,
        licenseType: this.selectedLicense
          ? this.selectedLicense
          : this.user.result.licenseType,
        authorities: values.authorities,
        activated: values.accountStatus === AccountStatus.ACTIVATED,
        jobTitle: values.jobTitle,
        company: values.company,
        city: values.city,
        country: values.country,
      };
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
            client
              .getUserTokensUsingGET({
                login: updatedUserDTO.login,
              })
              .then(
                tokens => {
                  notifySuccess('Updated User');
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

  render() {
    return (
      <If condition={this.user.isPending || this.tokens.isPending}>
        <Then>
          <LoadingIndicator isLoading={true}>
            Loading user information
          </LoadingIndicator>
        </Then>
        <Else>
          <If condition={this.user.isError}>
            <Then>
              <Alert variant={'danger'}>Error loading user information</Alert>
            </Then>
            <Else>
              {this.user.result !== undefined && (
                <AvForm onValidSubmit={this.updateUser}>
                  <div>
                    <Row className={getSectionClassName()}>
                      <Col>
                        <AvField
                          name="email"
                          value={this.user.result.email}
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
                          value={this.user.result.firstName}
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
                          value={this.user.result.lastName}
                          disabled
                        />
                        <AvField
                          name="createdDate"
                          label={<b>Created Date</b>}
                          value={this.user.result.createdDate}
                          disabled
                        />
                        <AvField
                          name="lastModifiedBy"
                          label={<b>Last Modified By</b>}
                          value={this.user.result.lastModifiedBy}
                          disabled
                        />
                        <AvField
                          name="lastModifiedDate"
                          label={<b>Last Modified Date</b>}
                          value={this.user.result.lastModifiedDate}
                          disabled
                        />
                        <AvField
                          name="activationKey"
                          label={<b>Activation Key</b>}
                          value={this.user.result.activationKey}
                          disabled
                        />
                        <AvField
                          name="resetKey"
                          label={<b>Reset Key</b>}
                          value={this.user.result.resetKey}
                          disabled
                        />
                      </Col>
                    </Row>
                    <Row className={getSectionClassName(false)}>
                      <Col>
                        <TokenInputGroups
                          changeTokenExpirationDate={true}
                          tokens={this.tokens.result}
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
                          value={this.user.result.jobTitle}
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
                          value={this.user.result.company}
                        />
                        <AvField
                          name="city"
                          label={
                            <BoldAccountTitle
                              title={ACCOUNT_TITLES.CITY}
                              licenseType={this.selectedLicense}
                            />
                          }
                          value={this.user.result.city}
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
                          value={this.user.result.country}
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
                          value={this.selectedAccountType}
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
                            this.user.result.activated
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
                          value={this.user.result.authorities}
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
