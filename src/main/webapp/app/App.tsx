import * as React from 'react';
import Main from './pages/Main';
import AppStore, { IAppConfig } from 'app/store/AppStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { Provider } from 'mobx-react';

class App extends React.Component {
  readonly stores: any = {};

  constructor(props: IAppConfig) {
    super(props);
    this.stores.appStore = new AppStore();
    this.stores.authenticationStore = new AuthenticationStore();
  }

  public render() {
    return (
      <div className="App">
        <Provider {...this.stores}>
          <Main {...this.stores} />
        </Provider>
      </div>
    );
  }
}

export default App;
