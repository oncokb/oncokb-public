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
import DocumentTitle from 'react-document-title';
import { DOCUMENT_TITLES } from 'app/config/constants';
import { setRecaptchaToken } from 'app/indexUtils';
import { observable, action } from 'mobx';
import autobind from 'autobind-decorator';
import Reaptcha from 'reaptcha';

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
    this.stores.windowStore.recaptchaRef = React.createRef();
  }

  @autobind
  @action
  onExecuteChange(value: string) {
    setRecaptchaToken(value);
    // this.stores.windowStore.recaptchaRef.current.getResponse().then((token: string) => {
    //   console.log(token)
    // })

    // this.stores.windowStore.recaptchaRef.current.reset().then(()=>{
    //   this.stores.windowStore.recaptchaRef.current.execute()
    // })
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
      <DocumentTitle title={DOCUMENT_TITLES.HOME}>
        <>
          {/* <Reaptcha
            ref={this.stores.windowStore.recaptchaRef}
            sitekey="6LcxRsMZAAAAAFYpXX6KAc9ASGSf8IptsIKehJby"
            onVerify={this.onExecuteChange}
            onRender={() =>
              this.stores.windowStore.recaptchaRef.current.execute()
            }
            size="invisible"
          /> */}
          {
            <Provider {...this.stores}>
              <Router history={history}>
                <Main {...this.stores} />
              </Router>
            </Provider>
          }
        </>
      </DocumentTitle>
    );
  }
}

export default App;
