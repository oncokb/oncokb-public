import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import { Redirect } from 'react-router-dom';
import AuthenticationStore from 'app/store/AuthenticationStore';
import {
  ACCOUNT_TITLES,
  H5_FONT_SIZE,
  LicenseType,
  PAGE_ROUTE,
} from 'app/config/constants';
import {
  getAccountInfoTitle,
  getLicenseTitle,
  getSectionClassName,
} from 'app/pages/account/AccountUtils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import classnames from 'classnames';
import { Row, Col } from 'react-bootstrap';
import SmallPageContainer from 'app/components/SmallPageContainer';
import { Token } from 'app/shared/api/generated/API';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import InfoIcon from 'app/shared/icons/InfoIcon';
import TokenInputGroups from 'app/components/tokenInputGroups/TokenInputGroups';
import client from 'app/shared/api/clientInstance';

export type IRegisterProps = {
  authenticationStore: AuthenticationStore;
};

export const InfoRow: React.FunctionComponent<{
  title: JSX.Element | string;
  content?: JSX.Element | string;
  direction?: 'vertical' | 'horizontal';
}> = props => {
  let titleWidth = 4;
  let contentWidth = 8;
  if (props.direction && props.direction === 'vertical') {
    titleWidth = contentWidth = 12;
  }
  return (
    <Row className={'mb-2'}>
      <Col sm={titleWidth}>{props.title}</Col>
      <Col sm={contentWidth}>
        {props.content}
        {props.children}
      </Col>
    </Row>
  );
};

@inject('authenticationStore')
@observer
export class AccountPage extends React.Component<IRegisterProps> {
  @observable enableRegenerateToken = true;
  @observable copiedIdToken = false;

  constructor(props: Readonly<IRegisterProps>) {
    super(props);
  }

  @autobind
  @action
  handleValidSubmit(event: any, values: any) {}

  @computed
  get account() {
    return this.props.authenticationStore.account;
  }

  @action
  deleteToken(token: Token) {
    this.props.authenticationStore
      .deleteToken(token)
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
  addNewToken() {
    this.props.authenticationStore
      .generateIdToken()
      .then(() => {
        notifySuccess('Token is added');
      })
      .catch(() => {
        this.enableRegenerateToken = false;
      });
  }

  @computed
  get generateTokenEnabled() {
    return this.enableRegenerateToken && this.tokens.length < 1;
  }

  @computed
  get tokens() {
    return this.props.authenticationStore.tokens;
  }

  @computed
  get licenseTitle() {
    if (!this.account) {
      return '';
    }
    const license = getLicenseTitle(this.account.licenseType as LicenseType);
    if (license) {
      return license.title;
    } else {
      return '';
    }
  }

  getContent() {
    if (this.account === undefined) {
      return <Redirect to={PAGE_ROUTE.LOGIN} />;
    }
    return (
      <SmallPageContainer size={'lg'}>
        <Row className={getSectionClassName(true)}>
          <Col>
            <h5>Account</h5>
            <InfoRow
              title={getAccountInfoTitle(
                ACCOUNT_TITLES.EMAIL,
                this.account.licenseType as LicenseType
              )}
              content={this.account.email}
            />
            <InfoRow
              title={getAccountInfoTitle(
                ACCOUNT_TITLES.NAME,
                this.account.licenseType as LicenseType
              )}
              content={`${this.account.firstName} ${this.account.lastName}`}
            />
            <InfoRow
              title={getAccountInfoTitle(
                ACCOUNT_TITLES.LICENSE_TYPE,
                this.account.licenseType as LicenseType
              )}
              content={this.licenseTitle}
            />
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col>
            <h5>
              {getAccountInfoTitle(
                ACCOUNT_TITLES.COMPANY,
                this.account.licenseType as LicenseType
              )}
            </h5>
            <InfoRow
              title={getAccountInfoTitle(
                ACCOUNT_TITLES.POSITION,
                this.account.licenseType as LicenseType
              )}
              content={this.account.jobTitle}
            />
            <InfoRow
              title={getAccountInfoTitle(
                ACCOUNT_TITLES.COMPANY,
                this.account.licenseType as LicenseType
              )}
              content={this.account.companyName}
            />
            <InfoRow
              title={getAccountInfoTitle(
                ACCOUNT_TITLES.CITY,
                this.account.licenseType as LicenseType
              )}
              content={this.account.city}
            />
            <InfoRow
              title={getAccountInfoTitle(
                ACCOUNT_TITLES.COUNTRY,
                this.account.licenseType as LicenseType
              )}
              content={this.account.country}
            />
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col>
            <div className={'d-flex align-items-center'}>
              <span style={{ fontSize: H5_FONT_SIZE }}>API</span>
              <InfoIcon
                placement={'top'}
                overlay={
                  'You can have one token to be used. Your token will be automatically renewed after reviewing the license and account information.'
                }
                className={'ml-2'}
              />
            </div>
            <InfoRow
              title={
                <div className={'d-flex align-items-center'}>
                  <span>
                    {getAccountInfoTitle(
                      ACCOUNT_TITLES.API_TOKEN,
                      this.account.licenseType as LicenseType
                    )}
                  </span>
                  {this.generateTokenEnabled ? (
                    <DefaultTooltip
                      placement={'top'}
                      overlay={
                        this.enableRegenerateToken
                          ? 'Get a new token'
                          : 'You cannot add a token at the moment, please try again later.'
                      }
                    >
                      {this.enableRegenerateToken ? (
                        <i
                          className={classnames('ml-2 fa fa-plus')}
                          onClick={this.addNewToken}
                        ></i>
                      ) : (
                        <i
                          className={classnames(
                            'ml-2 fa fa-exclamation-triangle text-warning'
                          )}
                        ></i>
                      )}
                    </DefaultTooltip>
                  ) : null}
                </div>
              }
            >
              <TokenInputGroups
                changeTokenExpirationDate={false}
                tokens={this.tokens}
                onDeleteToken={this.deleteToken}
              />
            </InfoRow>
          </Col>
        </Row>
      </SmallPageContainer>
    );
  }

  render() {
    return <>{this.account ? this.getContent() : null}</>;
  }
}
