import * as React from 'react';
import Main from './Main';
import AppStore, { IAppConfig } from 'app/store/AppStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { Provider, observer } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { RouterStore, SynchronizedHistory } from 'mobx-react-router';
import { Router, withRouter } from 'react-router';
import { syncHistoryWithStore } from 'mobx-react-router';
import { createBrowserHistory } from 'history';

export type Stores = {
  appStore: AppStore;
  authenticationStore: AuthenticationStore;
  windowStore: WindowStore;
  routing: RouterStore;
};

@observer
class App extends React.Component {
  readonly stores: Stores = {
    appStore: new AppStore(),
    authenticationStore: new AuthenticationStore(),
    windowStore: new WindowStore(),
    routing: new RouterStore()
  };

  constructor(props: IAppConfig) {
    super(props);
  }

  componentWillUnmount(): void {
    this.stores.authenticationStore.destroy();
  }

  // We need to deal with old links that use hash sign before each page
  checkHash(history: SynchronizedHistory) {
    if (
      history.location.hash &&
      history.location.hash.startsWith('#/') &&
      history.location.pathname === '/'
    ) {
      history.replace(history.location.hash.substring(2));
    }
  }

  public render() {
    const browserHistory = createBrowserHistory();
    const history = syncHistoryWithStore(browserHistory, this.stores.routing);

    this.checkHash(history);

    return (
      <Provider {...this.stores}>
        <Router history={history}>
          <Main {...this.stores} />
        </Router>
      </Provider>
    );
  }
}

export default App;
