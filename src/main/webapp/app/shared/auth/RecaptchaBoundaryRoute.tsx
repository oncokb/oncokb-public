import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import { observer } from 'mobx-react';
import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { ContactLink } from '../links/ContactLink';
import AppStore from 'app/store/AppStore';
import ReCAPTCHA from '../recaptcha/recaptcha';
import { setRecaptchaToken } from 'app/indexUtils';
import client from 'app/shared/api/clientInstance';
import { OncoKBError } from '../alert/ErrorAlertUtils';
import { PAGE_ROUTE } from 'app/config/constants';
import HomePage from 'app/pages/HomePage';
import { AppConfig } from 'app/appConfig';

export interface IRecaptchaBoundaryRoute extends RouteProps {
  isUserAuthenticated: boolean;
  appStore: AppStore;
}

@observer
export class RecaptchaBoundaryRoute extends React.Component<
  IRecaptchaBoundaryRoute
> {
  public recaptcha = new ReCAPTCHA();
  public recaptchaValidated: boolean;
  public recaptchaEnabled: boolean;
  public recaptchaError: any;

  async loadData() {
    try {
      const token: string = await this.recaptcha.getToken();
      setRecaptchaToken(token);
      client
        .validateRecaptchaUsingGET({})
        .then(this.successToValidate, this.failedToValidate);
    } catch (e) {
      this.recaptchaError = e;
    }
  }

  successToValidate() {
    this.recaptchaValidated = true;
  }

  failedToValidate(error: OncoKBError) {
    this.recaptchaValidated = false;
  }

  render() {
    this.recaptchaEnabled = AppConfig.serverConfig.recaptchaEnabled;

    if (this.recaptchaEnabled) {
      this.loadData();

      return this.recaptchaValidated === true ? (
        <ErrorBoundaryRoute {...this.props} />
      ) : (
        <Route exact path={PAGE_ROUTE.HOME} component={HomePage} />
      );
    } else {
      return <ErrorBoundaryRoute {...this.props} />;
    }
  }
}
