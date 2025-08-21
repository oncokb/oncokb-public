import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'typeface-open-sans';
import * as superagent from 'superagent';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import * as Sentry from '@sentry/react';

import 'font-awesome/css/font-awesome.css';
import './index.scss';
import './cassie.scss';
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

    // If the code is 401, which means the token has expired, we need to refresh the page
    // But in certain pages, 401 is a valid response
    if (
      response &&
      response.statusCode === 401 &&
      AppConfig.serverConfig.token &&
      AppConfig.serverConfig.appProfile === AppProfile.PROD &&
      response.req &&
      // we do not reload the page when the /api/authenticate failed
      response.req.url !== API_ROUTE.AUTHENTICATE &&
      UNAUTHORIZED_ALLOWED_PATH.some(path =>
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
        if (AppConfig.serverConfig?.sentryProjectId) {
          // Send an error to sentry
          Sentry.captureException(
            new Error(
              `The user cannot reload the page with the newest public website token. The website has retried ${WEBSITE_RELOAD_TIMES_THRESHOLD} time(s). The token currently used is ${getPublicWebsiteToken()}`
            )
          );
        }
      }
    }
    callback(error, response);
  });
};

if (AppConfig.serverConfig?.sentryProjectId) {
  Sentry.init({
    // Adjust tracesSampleRate for production.
    // For more information, please see https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#tracing-options
    dsn: AppConfig.serverConfig.sentryProjectId,
    // integrations: [new Sentry.Replay()],
    environment: 'production',
    tracesSampleRate: 0.5,
    // disable replays since calls to blob:https://*.oncokb.org are blocked
    // replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      // the following errors are for this project only
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed',
      'Request has been terminated',
      'Failed to fetch all transcripts',
      'Non-Error promise rejection captured',

      // the following are suggested ignores by the community coming from https://gist.github.com/Chocksy/e9b2cdd4afc2aadc7989762c4b8b495a
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
      // Generic error code from errors outside the security sandbox
      // You can delete this if using raven.js > 1.0, which ignores these automatically.
      'Script error.',
      // Avast extension error
      '_avast_submit',
    ],
    // Skip the common browser extension ad 3rd party script. List from https://gist.github.com/Chocksy/e9b2cdd4afc2aadc7989762c4b8b495a
    denyUrls: [
      new RegExp('.*localhost.*'),
      // Google Adsense
      /pagead\/js/i,
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
      // Woopra flakiness
      /eatdifferent\.com\.woopra-ns\.com/i,
      /static\.woopra\.com\/js\/woopra\.js/i,
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Other plugins
      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
      /webappstoolbarba\.texthelp\.com\//i,
      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
    ],

    // Called for message and error events
    beforeSend(event) {
      // identify deprecated API that used for mutation mapper. Do not report such event.
      // we need to upgrade mutation mapper but it's limited by our node version
      const hasInvalidUrl =
        (
          event.breadcrumbs?.filter(breadcrumb => {
            const url = breadcrumb.data?.url || '';
            return url.includes('getMutationAligner.json');
          }) || []
        ).length > 0;

      if (hasInvalidUrl) {
        return null;
      } else {
        return event;
      }
    },
  });
}

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
// registerServiceWorker();
