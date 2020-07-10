import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'typeface-open-sans';
import * as superagent from 'superagent';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import * as Sentry from '@sentry/browser';

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
  AUTH_WEBSITE_TOKEN_KEY
} from 'app/indexUtils';
import {
  ONCOKB_PUBLIC_APP_PROFILE,
  ONCOKB_PUBLIC_APP_PUBLIC_TOKEN,
  UNAUTHORIZED_ALLOWED_PATH
} from 'app/config/constants';
import _ from 'lodash';

assignPublicToken();

// Manually attach token to
// @ts-ignore
const query = superagent.Request.prototype.query;
// @ts-ignore
const end = superagent.Request.prototype.end;

const WEBSITE_RELOAD_TIMES_KEY = 'oncokb-website-reload-times';
const WEBSITE_RELOAD_TIMES_THRESHOLD = 10;

// @ts-ignore
superagent.Request.prototype.query = function(queryParameters: any) {
  const token = getStoredToken();
  if (token) {
    this.set('Authorization', `Bearer ${token}`);
  }
  return query.call(this, queryParameters);
};

// @ts-ignore
superagent.Request.prototype.end = function(callback) {
  return end.call(this, (error: any, response: any) => {
    // the swagger coden only returns response body
    // But in the case of the text/plain, the response should come from the response.text
    if (
      response &&
      response.statusCode === 200 &&
      response.headers &&
      response.headers['content-type'] &&
      ['application/zip', 'text/plain;'].some(item =>
        response.headers['content-type'].includes(item)
      )
    ) {
      response.body = response.text;
    }

    // If the code is 401, which means the token has expired, we need to refresh the page
    // But in certain pages, 401 is a valid response
    if (
      response &&
      response.statusCode === 401 &&
      window[ONCOKB_PUBLIC_APP_PUBLIC_TOKEN] &&
      window[ONCOKB_PUBLIC_APP_PROFILE] === 'PROD' &&
      response.req &&
      !_.some(UNAUTHORIZED_ALLOWED_PATH, path =>
        window.location.pathname.endsWith(path)
      )
    ) {
      const currentDate = new Date();

      const STORAGE_KEY = `${WEBSITE_RELOAD_TIMES_KEY}-${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}-${currentDate.getHours()}`;
      if (localStorage.getItem(STORAGE_KEY) == null) {
        localStorage.setItem(STORAGE_KEY, '0');
      }
      if (
        Number(localStorage.getItem(STORAGE_KEY)) <=
        WEBSITE_RELOAD_TIMES_THRESHOLD
      ) {
        const newIncrement = Number(localStorage.getItem(STORAGE_KEY)) + 1;
        localStorage.setItem(STORAGE_KEY, `${newIncrement}`);
        window.location.reload();
      } else {
        // Send an error to sentry
        Sentry.captureException(
          new Error(
            `The user cannot reload the page with the newest public website token. The website has retried ${WEBSITE_RELOAD_TIMES_THRESHOLD} time(s). The token currently used is ${localStorage.getItem(
              AUTH_WEBSITE_TOKEN_KEY
            )}`
          )
        );
      }
    }
    callback(error, response);
  });
};

// the dsn is supposed to be different for different installation,
// but since the serverConfigs hasn't been defined yet, it is ok for now.
Sentry.init({
  dsn:
    'https://387bb103057b40659f3044069b7c0517@o76124.ingest.sentry.io/1793966',
  blacklistUrls: [new RegExp('.*localhost.*')]
});
ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
// registerServiceWorker();
