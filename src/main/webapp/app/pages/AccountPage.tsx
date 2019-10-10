import React from 'react';
import { Col, Row } from 'reactstrap';
import { inject, observer } from 'mobx-react';
import { action, computed } from 'mobx';
import autobind from 'autobind-decorator';
import { Redirect } from 'react-router-dom';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { ACCOUNT_TITLES, LicenseType, PAGE_ROUTE } from 'app/config/constants';
import { getAccountInfoTitle, getLicenseTitle, getSectionClassName } from 'app/pages/account/AccountUtils';


export type IRegisterProps = {
  authenticationStore: AuthenticationStore;
};

@inject('authenticationStore')
@observer
export class AccountPage extends React.Component<IRegisterProps> {
  @autobind
  @action
  handleValidSubmit(event: any, values: any) {
  }

  @computed
  get account() {
    return this.props.authenticationStore.account.result;
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
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.USER_NAME, this.account.licenseType as LicenseType), this.account.login)}
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.NAME, this.account.licenseType as LicenseType), `${this.account.firstName} ${this.account.lastName}`)}
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.EMAIL, this.account.licenseType as LicenseType), this.account.email)}
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.LICENSE_TYPE, this.account.licenseType as LicenseType), this.licenseTitle)}
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col>
              <h5>Company</h5>
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.POSITION, this.account.licenseType as LicenseType), this.account.jobTitle)}
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.COMPANY, this.account.licenseType as LicenseType), this.account.company)}
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.CITY, this.account.licenseType as LicenseType), this.account.city)}
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.COUNTRY, this.account.licenseType as LicenseType), this.account.country)}
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col>
              <h5>API</h5>
              {this.getInfoRow(getAccountInfoTitle(ACCOUNT_TITLES.API_TOKEN, this.account.licenseType as LicenseType), this.props.authenticationStore.idToken)}
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
