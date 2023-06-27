import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import AppStore from 'app/store/AppStore';
import ReCAPTCHA from '../recaptcha/recaptcha';
import { setRecaptchaToken } from 'app/indexUtils';
import client from 'app/shared/api/clientInstance';
import { OncoKBError } from '../alert/ErrorAlertUtils';
import * as Sentry from '@sentry/react';
import { PAGE_ROUTE } from 'app/config/constants';
import HomePage from 'app/pages/HomePage';

export interface IRecaptchaBoundaryRoute extends RouteProps {
  isUserAuthenticated: boolean;
  appStore: AppStore;
}

@observer
export class RecaptchaBoundaryRoute extends React.Component<
  IRecaptchaBoundaryRoute
> {
  recaptcha = new ReCAPTCHA();

  @observable recaptchaValidated = false;
  @observable recaptchaError: any;

  loadData() {
    if (
      this.recaptcha.siteKey &&
      this.recaptcha !== undefined &&
      !this.recaptchaValidated &&
      this.recaptchaError === undefined
    ) {
      try {
        if (this.recaptcha !== undefined) {
          this.recaptcha.getToken().then(token => setRecaptchaToken(token));
          client
            .validateRecaptchaUsingGET({})
            .then(this.successToValidate, this.failedToValidate);
        }
      } catch (e) {
        this.recaptchaError = e;
      }
    }
  }

  successToValidate() {
    this.recaptchaValidated = true;
  }

  failedToValidate(error: OncoKBError) {
    this.recaptchaValidated = false;
    Sentry.captureException(error);
  }

  runAfterRender = () => {
    const recaptchaElem = document.getElementById('script');
    if (recaptchaElem) {
      this.loadData();
    }
  };

  render() {
    this.runAfterRender();
    if (
      this.recaptcha.siteKey &&
      this.recaptcha !== undefined &&
      this.recaptchaValidated &&
      this.recaptchaError === undefined
    ) {
      return this.recaptchaValidated ? (
        <ErrorBoundaryRoute {...this.props} />
      ) : (
        <Route exact path={PAGE_ROUTE.HOME} component={HomePage} />
      );
    } else {
      return <ErrorBoundaryRoute {...this.props} />;
    }
  }
}
