import * as React from 'react';
import Main from './Main';
import AppStore, { IAppConfig } from 'app/store/AppStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { Provider } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { RouterStore } from 'mobx-react-router';

export type Stores = {
  appStore: AppStore;
  authenticationStore: AuthenticationStore;
  windowStore: WindowStore;
  routing: RouterStore;
};

// TODO: need to include the browser history https://github.com/alisd23/mobx-react-router
// const browserHistory = createBrowserHistory();

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

  public render() {
    return (
      <Provider {...this.stores}>
        <Main {...this.stores} />
      </Provider>
    );
  }
}

export default App;
