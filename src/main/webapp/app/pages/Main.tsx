import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Loadable from 'react-loadable';

import Footer from '../components/Footer';
import Header from '../components/Header';
import About from './About';
import Home from './Home';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import AppStore from 'app/store/AppStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RegisterPage } from 'app/components/account/register';
import { observer, inject } from 'mobx-react';
import { PrivateRoute } from 'app/shared/auth/private-route';
import { AUTHORITIES } from '../../app-backup/config/constants';
import { Login } from 'app/components/login/login';
import { Logout } from 'app/components/login/logout';

// tslint:disable:space-in-parens
const Account = Loadable({
  loader: () => import(/* webpackChunkName: "account" */ 'app/pages/menus/account.tsx'),
  loading: () => <div>loading ...</div>
});

export interface IMainPage {
  appStore: AppStore;
  authenticationStore: AuthenticationStore;
}

@inject('appStore', 'authenticationStore')
@observer
class Main extends React.Component<IMainPage> {
  public isAuthorized(userAuthorities: string[], hasAnyAuthorities: string[]) {
    if (hasAnyAuthorities === undefined) {
      return true;
    }
    if (userAuthorities && userAuthorities.length !== 0) {
      if (hasAnyAuthorities.length === 0) {
        return true;
      }
      return hasAnyAuthorities.some(auth => userAuthorities.includes(auth));
    }
    return false;
  }

  public render() {
    const HomePage = () => <Home content={'test'} />;

    return (
      <BrowserRouter>
        <div className="Main">
          <Header
            isAuthenticated={this.props.authenticationStore.isAuthenticated}
            isAdmin={this.isAuthorized(this.props.authenticationStore.account.authorities, [AUTHORITIES.ADMIN])}
            ribbonEnv={''}
            isInProduction={false}
            isSwaggerEnabled
          />
          <div
            style={{
              marginLeft: '2rem',
              marginRight: '2rem',
              paddingTop: 20,
              paddingBottom: 100,
              fontSize: '1.25rem',
              color: '#2c3e50'
            }}
          >
            <Switch>
              <ErrorBoundaryRoute path="/login" component={Login} />
              <ErrorBoundaryRoute path="/logout" component={Logout} />
              <ErrorBoundaryRoute path="/register" component={RegisterPage} />
              <PrivateRoute
                path="/account"
                authenticationStore={this.props.authenticationStore}
                component={Account}
                isAuthorized={this.isAuthorized(this.props.authenticationStore.account.authorities, [AUTHORITIES.ADMIN, AUTHORITIES.USER])}
              />
              <Route exact path="/" component={HomePage} />
              <Route exact path="/about" component={About} />
            </Switch>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

export default Main;
