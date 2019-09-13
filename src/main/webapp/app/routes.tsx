import * as React from 'React';
import { Route, Switch } from 'react-router-dom';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import Login from 'app/components/login/login';
import { Logout } from 'app/components/login/logout';
import { RegisterPage } from 'app/components/account/register';
import { PrivateRoute } from 'app/shared/auth/private-route';
import About from 'app/pages/About';
import Loadable from 'react-loadable';
import { AUTHORITIES } from 'app/config/constants';
import Home from 'app/pages/Home';
import DataAccessPage from 'app/pages/DataAccessPage';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { inject } from 'mobx-react';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { TermsPage } from 'app/pages/TermsPage';
import { TeamPage } from 'app/pages/TeamPage';
import { NewsPage } from 'app/pages/NewsPage';

// tslint:disable:space-in-parens
const Account = Loadable({
  loader: () => import(/* webpackChunkName: "account" */ 'app/pages/menus/account.tsx'),
  loading: () => <div>loading ...</div>
});

const AppRouts = inject('authenticationStore')((props: { authenticationStore?: AuthenticationStore }) => {
  const HomePage = () => <Home content={'test'} />;
  return (
    <Switch>
      <ErrorBoundaryRoute path="/login" component={Login} />
      <ErrorBoundaryRoute path="/logout" component={Logout} />
      <ErrorBoundaryRoute path="/register" component={RegisterPage} />
      <ErrorBoundaryRoute path="/dataAccess" component={DataAccessPage} />
      <ErrorBoundaryRoute path="/terms" component={TermsPage} />
      <ErrorBoundaryRoute path="/team" component={TeamPage} />
      <ErrorBoundaryRoute path="/news" component={NewsPage} />
      <PrivateRoute
        path="/account"
        authenticationStore={props.authenticationStore!}
        component={Account}
        isAuthorized={
          props.authenticationStore!.account &&
          isAuthorized(props.authenticationStore!.account.authorities, [AUTHORITIES.ADMIN, AUTHORITIES.USER])
        }
      />
      <Route exact path="/" component={HomePage} />
      <Route exact path="/about" component={About} />
    </Switch>
  );
});
export default AppRouts;
