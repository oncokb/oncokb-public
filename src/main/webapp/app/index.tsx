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
import 'react-responsive-tabs/styles.css';
import 'react-mutation-mapper/dist/styles.css';

import { assignPublicToken, getStoredToken } from 'app/indexUtils';
import { AUTH_UER_TOKEN_KEY, AUTH_WEBSITE_TOKEN_KEY } from 'app/store/AuthenticationStore';
import { Storage } from 'react-jhipster';
import { ONCOKB_APP_PROPS, ONCOKB_APP_PUBLIC_TOKEN, OncokbAppProps } from 'app/config/constants';

assignPublicToken();

// Manually attach token to
// @ts-ignore
const query = superagent.Request.prototype.query;
// @ts-ignore
const end = superagent.Request.prototype.end;

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
      ['application/zip', 'text/plain;'].some(item => response.headers['content-type'].includes(item))
    ) {
      response.body = response.text;
    }

    // If the code is 401, which means the token has expired, we need to refresh the page
    // const oncokbAppProps: OncokbAppProps = window[ONCOKB_APP_PROPS];
    // if (response && response.statusCode === 401 && window[ONCOKB_APP_PUBLIC_TOKEN] && oncokbAppProps.profile === 'PROD') {
    //   window.location.reload();
    // }
    callback(error, response);
  });
};

// the dsn is supposed to be different for different installation,
// but since the serverConfigs hasn't been defined yet, it is ok for now.
Sentry.init({
  dsn: 'https://387bb103057b40659f3044069b7c0517@sentry.io/1793966',
  blacklistUrls: [new RegExp('.*localhost.*')]
});
ReactDOM.render(<App/>, document.getElementById('root') as HTMLElement);
registerServiceWorker();
