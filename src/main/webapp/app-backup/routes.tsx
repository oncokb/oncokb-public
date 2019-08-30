import React from 'react';
import { Switch } from 'react-router-dom';
import Loadable from 'react-loadable';

import Login from 'app-backup/modules/login/login';
import Register from 'app-backup/modules/account/register/register';
import Activate from 'app-backup/modules/account/activate/activate';
import PasswordResetInit from 'app-backup/modules/account/password-reset/init/password-reset-init';
import PasswordResetFinish from 'app-backup/modules/account/password-reset/finish/password-reset-finish';
import Logout from 'app-backup/modules/login/logout';
import Home from 'app-backup/modules/home/home';
import Entities from 'app-backup/entities';
import PrivateRoute from 'app-backup/shared/auth/private-route';
import ErrorBoundaryRoute from 'app-backup/shared/error/error-boundary-route';
import PageNotFound from 'app-backup/shared/error/page-not-found';
import { AUTHORITIES } from 'app-backup/config/constants';

// tslint:disable:space-in-parens
const Account = Loadable({
  loader: () => import(/* webpackChunkName: "account" */ 'app-backup/modules/account'),
  loading: () => <div>loading ...</div>
});

const Admin = Loadable({
  loader: () => import(/* webpackChunkName: "administration" */ 'app-backup/modules/administration'),
  loading: () => <div>loading ...</div>
});
// tslint:enable

const Routes = () => (
  <div className="view-routes">
    <Switch>
      <ErrorBoundaryRoute path="/login" component={Login} />
      <ErrorBoundaryRoute path="/logout" component={Logout} />
      <ErrorBoundaryRoute path="/register" component={Register} />
      <ErrorBoundaryRoute path="/activate/:key?" component={Activate} />
      <ErrorBoundaryRoute path="/reset/request" component={PasswordResetInit} />
      <ErrorBoundaryRoute path="/reset/finish/:key?" component={PasswordResetFinish} />
      <PrivateRoute path="/admin" component={Admin} hasAnyAuthorities={[AUTHORITIES.ADMIN]} />
      <PrivateRoute path="/account" component={Account} hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]} />
      <PrivateRoute path="/entity" component={Entities} hasAnyAuthorities={[AUTHORITIES.USER]} />
      <ErrorBoundaryRoute path="/" exact component={Home} />
      <ErrorBoundaryRoute component={PageNotFound} />
    </Switch>
  </div>
);

export default Routes;
