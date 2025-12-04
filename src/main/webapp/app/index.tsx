import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'typeface-open-sans';
import * as superagent from 'superagent';
import * as Sentry from '@sentry/react';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

import 'font-awesome/css/font-awesome.css';
import './index.scss';
import 'react-table/react-table.css';
import 'oncokb-styles/dist/oncokb.css';
import 'cbioportal-frontend-commons/dist/styles.css';
import 'react-responsive-tabs/styles.css';
import 'react-mutation-mapper/dist/styles.css';
import 'react-toastify/dist/ReactToastify.css';

import {
  assignPublicToken,
  getStoredToken,
  getPublicWebsiteToken,
  getStoredRecaptchaToken,
} from 'app/indexUtils';
import { API_ROUTE, UNAUTHORIZED_ALLOWED_PATH } from 'app/config/constants';
import { AppConfig, AppProfile } from 'app/appConfig';
import { notifyError } from 'app/shared/utils/NotificationUtils';

assignPublicToken();

// Manually attach token to
// @ts-ignore
const query = superagent.Request.prototype.query;
// @ts-ignore
const end = superagent.Request.prototype.end;

const WEBSITE_RELOAD_TIMES_KEY = 'oncokb-website-reload-times';
const WEBSITE_RELOAD_TIMES_THRESHOLD = 10;

// @ts-ignore
superagent.Request.prototype.query = function (queryParameters: any) {
  const token = getStoredToken();
  if (token) {
    this.set('Authorization', `Bearer ${token}`);
    if (
      this.url.endsWith('sqlDump') ||
      this.url.endsWith('transcriptSqlDump')
    ) {
      this.responseType('blob');
    }
  }
  const recaptchaToken = getStoredRecaptchaToken();
  if (recaptchaToken) {
    this.set('g-recaptcha-response', `${recaptchaToken}`);
  }

  return query.call(this, queryParameters);
};

// @ts-ignore
superagent.Request.prototype.end = function (callback) {
  return end.call(this, (error: any, response: any) => {
    // the swagger coden only returns response body
    // But in the case of the text/plain, the response should come from the response.text
    if (
      response &&
      response.statusCode === 200 &&
      response.headers &&
      response.headers['content-type'] &&
      ['text/plain'].some(item =>
        response.headers['content-type'].includes(item)
      )
    ) {
      response.body = response.text;
    }

    // Reload is not neccessary in dev environment
    if (AppConfig.serverConfig.appProfile !== AppProfile.PROD) {
      return callback(error, response);
    }

    // Only reload if the status code is 401, indicating the token might have expired.
    if (response?.statusCode !== 401) {
      return callback(error, response);
    }

    // We do not reload the page when the /api/authenticate fails
    // or on auth-related pages where 401 is a valid response
    if (
      response?.req?.url === API_ROUTE.AUTHENTICATE ||
      UNAUTHORIZED_ALLOWED_PATH.some(path =>
        window.location.pathname.endsWith(path)
      )
    ) {
      return callback(error, response);
    }

    // For the public website token, we want to reload the page to obtain a fresh token
    // because a new pub token is rotated in every day.
    const storedToken = getStoredToken();
    const publicWebsiteToken = getPublicWebsiteToken();

    if (!publicWebsiteToken || storedToken !== publicWebsiteToken) {
      return callback(error, response);
    }

    const currentDate = new Date();
    const STORAGE_KEY = `${WEBSITE_RELOAD_TIMES_KEY}-${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}-${currentDate.getHours()}`;

    if (localStorage.getItem(STORAGE_KEY) == null) {
      localStorage.setItem(STORAGE_KEY, '0');
    }

    const currentCount = Number(localStorage.getItem(STORAGE_KEY));

    // If we've already reloaded more than the threshold for this hour,
    // log to Sentry (if configured) or show a generic error to prevent
    // infinite reload.
    if (currentCount > WEBSITE_RELOAD_TIMES_THRESHOLD) {
      let message =
        'An unexpected error occurred while refreshing your session. Please reload the page and contact support if the issue persists.';

      if (
        AppConfig.serverConfig?.sentryProjectId &&
        // check if sentry is initialized
        Sentry.getCurrentHub().getClient()
      ) {
        const eventId = Sentry.captureException(
          new Error(
            `The user cannot reload the page with the newest public website token. The website has retried ${WEBSITE_RELOAD_TIMES_THRESHOLD} time(s). The token currently used is ${getPublicWebsiteToken()}`
          )
        );
        message = `${message} Code: ${eventId}`;
      }

      notifyError(new Error(message));

      return callback(error, response);
    }

    const newIncrement = currentCount + 1;
    localStorage.setItem(STORAGE_KEY, `${newIncrement}`);

    notifyError(
      new Error(
        'Unauthenticated session has expired. Please log in or reload the page to refresh. Page will automatically refresh in 5 seconds.'
      )
    );

    setTimeout(() => {
      window.location.reload();
    }, 5000);

    callback(error, response);
  });
};

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
// registerServiceWorker();
