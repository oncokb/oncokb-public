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
            .then(
              this.successToValidate.bind(this),
              this.failedToValidate.bind(this)
            );
        }
      } catch (e) {
        this.recaptchaError = e;
      }
    }
  }

  componentDidMount() {
    setTimeout(() => {
      const recaptchaElem = document.getElementById('recaptcha');
      if (recaptchaElem) {
        this.loadData();
      }
    }, 2000);
  }

  successToValidate() {
    this.recaptchaValidated = true;
  }

  failedToValidate(error: OncoKBError) {
    this.recaptchaError = error;
    Sentry.captureException(error);
  }

  render() {
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
