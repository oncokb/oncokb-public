import React from 'react';
import { Col, Row } from 'reactstrap';
import { inject, observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import { Redirect } from 'react-router-dom';
import AuthenticationStore from 'app/store/AuthenticationStore';
import client from 'app/shared/api/clientInstance';
import { ACCOUNT_TITLES, LicenseType, PAGE_ROUTE } from 'app/config/constants';
import { getAccountInfoTitle, getLicenseTitle, getSectionClassName } from 'app/pages/account/AccountUtils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import classnames from 'classnames';


export type IRegisterProps = {
  authenticationStore: AuthenticationStore;
};

const InfoRow: React.FunctionComponent<{
  title: string,
  content?: Element | string
}> = (props) => {
  return (
    <Row className={'mb-2'}>
      <Col sm="3">
        {props.title}
      </Col>
      <Col sm="9">
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
  @autobind
  @action
  handleValidSubmit(event: any, values: any) {
  }

  @computed
  get account() {
    return this.props.authenticationStore.account.result;
  }

  @autobind
  regenerateToken() {
    this.props.authenticationStore.generateIdToken()
      .catch(() => {
        this.enableRegenerateToken = false;
      })
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

  getInfoRow(title: string, content: string) {
    return (
      <Row className={'mb-2'}>
        <Col sm="3">
          {title}
        </Col>
        <Col sm="9">
          {content}
        </Col>
      </Row>
    );
  }

  getContent() {
    if (this.account === undefined) {
      return <Redirect to={PAGE_ROUTE.LOGIN}/>;
    }
    return (
      <Row className="justify-content-center">
        <Col lg={6}>
          <Row className={getSectionClassName(true)}>
            <Col>
              <h5>Account</h5>
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.USER_NAME, this.account.licenseType as LicenseType)} content={this.account.login} />
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.NAME, this.account.licenseType as LicenseType)} content={`${this.account.firstName} ${this.account.lastName}`} />
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.EMAIL, this.account.licenseType as LicenseType)} content={this.account.email} />
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.LICENSE_TYPE, this.account.licenseType as LicenseType)} content={this.licenseTitle} />
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col>
              <h5>Company</h5>
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.POSITION, this.account.licenseType as LicenseType)} content={this.account.jobTitle} />
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.COMPANY, this.account.licenseType as LicenseType)} content={this.account.company} />
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.CITY, this.account.licenseType as LicenseType)} content={this.account.city} />
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.COUNTRY, this.account.licenseType as LicenseType)} content={this.account.country} />
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col>
              <h5>API</h5>
              <InfoRow title={getAccountInfoTitle(ACCOUNT_TITLES.API_TOKEN, this.account.licenseType as LicenseType)}>
                <div>
                  <span>{this.props.authenticationStore.idToken}</span>
                  <DefaultTooltip
                    overlay={this.enableRegenerateToken ? 'Get a new token' : 'You cannot regenerate the token at the moment, please try again later.'}
                  >
                    <i className={classnames('fa fa-refresh ml-2', this.enableRegenerateToken ? '' : 'disabled')}
                       onClick={this.regenerateToken}
                    ></i>
                  </DefaultTooltip>
                </div>
              </InfoRow>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <>
        {this.account ? (
          this.getContent()
        ) : null}
      </>
    );
  }
}
