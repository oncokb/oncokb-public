import 'typeface-open-sans';
import * as superagent from 'superagent';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import 'bootstrap/dist/css/bootstrap.css';
import 'cbioportal-frontend-commons/styles.css';
import 'font-awesome/css/font-awesome.css';

import { loadIcons } from './config/icon-loader';
import { assignPublicToken } from 'app/indexUtils';
import { AUTH_TOKEN_KEY } from 'app/store/AuthenticationStore';
import { Storage } from 'react-jhipster';

loadIcons();

assignPublicToken();

// Manually attach token to
// @ts-ignore
const query = superagent.Request.prototype.query;
// @ts-ignore
superagent.Request.prototype.query = function(queryParameters: any) {
  const token = Storage.local.get(AUTH_TOKEN_KEY) || Storage.session.get(AUTH_TOKEN_KEY);
  if (token) {
    this.set('Authorization', `Bearer ${token}`);
  }
  return query.call(this, queryParameters);
};

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
registerServiceWorker();
