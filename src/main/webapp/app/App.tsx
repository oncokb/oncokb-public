import * as React from 'react';
import Main from './Main';
import AppStore, { IAppConfig } from 'app/store/AppStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { Provider, observer } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { RouterStore, SynchronizedHistory } from 'mobx-react-router';
import { Router } from 'react-router';
import { syncHistoryWithStore } from 'mobx-react-router';
import { createBrowserHistory } from 'history';
import DocumentTitle from 'react-document-title';
import { PAGE_TITLE, PAGE_ROUTE } from 'app/config/constants';
import { action } from 'mobx';
import autobind from 'autobind-decorator';
import { getPageTitle } from 'app/shared/utils/Utils';

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
    routing: new RouterStore(),
  };
  public recaptchaRef: any = React.createRef();
  public recaptchaRendered = false;

  constructor(props: IAppConfig) {
    super(props);
    this.stores.windowStore.registerOnClickEvent(this.executeRecaptcha);
  }

  @autobind
  @action
  public executeRecaptcha() {
    if (
      !this.stores.appStore.recaptchaVerified &&
      !this.stores.authenticationStore.isUserAuthenticated &&
      this.stores.routing.location.pathname !== PAGE_ROUTE.HOME &&
      this.recaptchaRef &&
      this.recaptchaRendered
    ) {
      this.recaptchaRef.current.execute();
    }
  }

  @autobind
  @action
  onRecaptchaVerify(value: string) {
    this.stores.appStore.recaptchaVerified = true;
  }

  @autobind
  @action
  onRecaptchaRender() {
    this.recaptchaRendered = true;
    this.executeRecaptcha();
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
      <DocumentTitle title={getPageTitle(PAGE_TITLE.HOME, false)}>
        <>
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
