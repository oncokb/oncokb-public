import 'typeface-open-sans';

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

loadIcons();

assignPublicToken();

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
registerServiceWorker();
