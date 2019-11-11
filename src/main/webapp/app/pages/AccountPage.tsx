import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import { Redirect } from 'react-router-dom';
import AuthenticationStore from 'app/store/AuthenticationStore';
import client from 'app/shared/api/clientInstance';
import { ACCOUNT_TITLES, LicenseType, PAGE_ROUTE } from 'app/config/constants';
import {
  getAccountInfoTitle,
  getLicenseTitle,
  getSectionClassName
} from 'app/pages/account/AccountUtils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import classnames from 'classnames';
import { Row, Col, InputGroup, FormControl, Button } from 'react-bootstrap';
import SmallPageContainer from 'app/components/SmallPageContainer';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Token } from 'app/shared/api/generated/API';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { getMomentInstance } from 'app/shared/utils/Utils';
import moment from 'moment';
import pluralize from 'pluralize';

export type IRegisterProps = {
  authenticationStore: AuthenticationStore;
};

const InfoRow: React.FunctionComponent<{
  title: JSX.Element | string;
  content?: JSX.Element | string;
}> = props => {
  return (
    <Row className={'mb-2'}>
      <Col sm="4">{props.title}</Col>
      <Col sm="8">
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

  @action
  onCopyIdToken() {
    this.copiedIdToken = true;
    setTimeout(() => (this.copiedIdToken = false), 5000);
  }

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
    return this.enableRegenerateToken && this.tokens.length < 2;
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

  getDuration(expireInDays: number, expireInHours: number) {
    return expireInDays > 0
      ? `${expireInDays} ${pluralize('day', expireInDays)}`
      : `${expireInHours} ${pluralize('hour', expireInHours)}`;
  }

  getContent() {
    if (this.account === undefined) {
      return <Redirect to={PAGE_ROUTE.LOGIN} />;
    }
    return (
      <SmallPageContainer>
        <Row className={getSectionClassName(true)}>
          <Col>
            <h5>Account</h5>
            <InfoRow
              title={getAccountInfoTitle(ACCOUNT_TITLES.EMAIL, this.account
                .licenseType as LicenseType)}
              content={this.account.email}
            />
            <InfoRow
              title={getAccountInfoTitle(ACCOUNT_TITLES.NAME, this.account
                .licenseType as LicenseType)}
              content={`${this.account.firstName} ${this.account.lastName}`}
            />
            <InfoRow
              title={getAccountInfoTitle(ACCOUNT_TITLES.LICENSE_TYPE, this
                .account.licenseType as LicenseType)}
              content={this.licenseTitle}
            />
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col>
            <h5>
              {getAccountInfoTitle(ACCOUNT_TITLES.COMPANY, this.account
                .licenseType as LicenseType)}
            </h5>
            <InfoRow
              title={getAccountInfoTitle(ACCOUNT_TITLES.POSITION, this.account
                .licenseType as LicenseType)}
              content={this.account.jobTitle}
            />
            <InfoRow
              title={getAccountInfoTitle(ACCOUNT_TITLES.COMPANY, this.account
                .licenseType as LicenseType)}
              content={this.account.company}
            />
            <InfoRow
              title={getAccountInfoTitle(ACCOUNT_TITLES.CITY, this.account
                .licenseType as LicenseType)}
              content={this.account.city}
            />
            <InfoRow
              title={getAccountInfoTitle(ACCOUNT_TITLES.COUNTRY, this.account
                .licenseType as LicenseType)}
              content={this.account.country}
            />
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col>
            <h5>API</h5>
            <InfoRow
              title={
                <div className={'d-flex align-items-center'}>
                  <span>
                    {getAccountInfoTitle(ACCOUNT_TITLES.API_TOKEN, this.account
                      .licenseType as LicenseType)}
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
              {this.tokens.map(token => {
                const today = moment.utc();
                const expiration = getMomentInstance(token.expiration);
                const expirationDay = moment
                  .duration(expiration.diff(today))
                  .days();
                const expirationHour = moment
                  .duration(expiration.diff(today))
                  .hours();
                return (
                  <div key={token.id} className={'mb-2'}>
                    <InputGroup size={'sm'}>
                      <FormControl
                        value={token.token}
                        type={'text'}
                        contentEditable={false}
                        disabled={true}
                      />
                      <InputGroup.Append>
                        <InputGroup.Text id="btnGroupAddon">
                          Expires in{' '}
                          {this.getDuration(expirationDay, expirationHour)}
                        </InputGroup.Text>
                        <CopyToClipboard
                          text={token.token}
                          onCopy={() => this.onCopyIdToken()}
                        >
                          <Button variant={'primary'}>
                            <DefaultTooltip
                              placement={'top'}
                              overlay={
                                this.copiedIdToken ? 'Copied' : 'Copy ID Token'
                              }
                            >
                              <i className={classnames('fa fa-copy')}></i>
                            </DefaultTooltip>
                          </Button>
                        </CopyToClipboard>
                        <DefaultTooltip
                          placement={'top'}
                          overlay={
                            this.tokens.length < 2
                              ? 'You need to have one valid token'
                              : 'Delete the token'
                          }
                        >
                          <Button
                            variant={'primary'}
                            disabled={this.tokens.length < 2}
                            onClick={() => this.deleteToken(token)}
                          >
                            <i className={classnames('fa fa-trash')}></i>
                          </Button>
                        </DefaultTooltip>
                      </InputGroup.Append>
                    </InputGroup>
                  </div>
                );
              })}
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
