import * as React from 'React';
import { Route, Switch } from 'react-router-dom';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import Login from 'app/components/login/LoginPage';
import { Logout } from 'app/components/login/logout';
import { RegisterPage } from 'app/pages/RegisterPage';
import { PrivateRoute } from 'app/shared/auth/private-route';
import { AboutPage } from 'app/pages/AboutPage';
import Loadable from 'react-loadable';
import { AUTHORITIES, PAGE_ROUTE } from 'app/config/constants';
import HomePage from 'app/pages/HomePage';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { inject } from 'mobx-react';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { TermsPage } from 'app/pages/TermsPage';
import { TeamPage } from 'app/pages/TeamPage';
import { NewsPage } from 'app/pages/newsPage/NewsPage';
import CancerGenesPage from 'app/pages/CancerGenesPage';
import ActionableGenesPage from 'app/pages/ActionableGenesPage';
import { RouterStore } from 'mobx-react-router';
import { LevelOfEvidencePage } from 'app/pages/LevelOfEvidencePage';
import GenePage from 'app/pages/genePage/GenePage';
import AlterationPage from 'app/pages/alterationPage/AlterationPage';
import { AccountPage } from 'app/pages/AccountPage';
import ActivateAccount from 'app/components/account/ActivateAccount';
import { PasswordResetInit } from 'app/components/account/PasswordResetInit';
import PasswordResetFinish from 'app/components/account/PasswordResetFinish';
import PageNotFound from '../shared/error/page-not-found';
import DataAccessPage from 'app/pages/DataAccessPage';
import AccountPassword from 'app/components/account/AccountPassword';
import AdminRouts from 'app/routes/AdminRoutes';

const AppRouts = (props: { authenticationStore: AuthenticationStore; routing: RouterStore }) => {
  return (
    <Switch>
      <ErrorBoundaryRoute path={PAGE_ROUTE.LOGIN} component={Login}/>
      <ErrorBoundaryRoute path={PAGE_ROUTE.LOGOUT} component={Logout}/>
      <ErrorBoundaryRoute path={PAGE_ROUTE.REGISTER} component={RegisterPage}/>
      <ErrorBoundaryRoute path={PAGE_ROUTE.DATA_ACCESS} component={DataAccessPage}/>
      <ErrorBoundaryRoute path={PAGE_ROUTE.CANCER_GENES} component={CancerGenesPage}/>
      <ErrorBoundaryRoute path={PAGE_ROUTE.ACTIONABLE_GENE} component={ActionableGenesPage}/>
      <ErrorBoundaryRoute exact path="/gene/:hugoSymbol" component={GenePage}/>
      <ErrorBoundaryRoute exact path="/gene/:hugoSymbol/:alteration" component={AlterationPage}/>
      <ErrorBoundaryRoute exact path="/gene/:hugoSymbol/:alteration/:tumorType" component={AlterationPage}/>
      <ErrorBoundaryRoute exact path="/gene/:hugoSymbol/:alteration/:tumorType" component={AlterationPage}/>
      <Route exact path={PAGE_ROUTE.HOME} component={HomePage}/>
      <Route exact path={PAGE_ROUTE.ABOUT} component={AboutPage}/>
      <Route exact path={PAGE_ROUTE.TERMS} component={TermsPage}/>
      <Route exact path={PAGE_ROUTE.TEAM} component={TeamPage}/>
      <Route exact path={PAGE_ROUTE.NEWS} component={NewsPage}/>
      <Route exact path={PAGE_ROUTE.LEVELS} component={LevelOfEvidencePage}/>
      <ErrorBoundaryRoute exact path={PAGE_ROUTE.ACCOUNT_ACTIVATE} component={ActivateAccount}/>
      <ErrorBoundaryRoute path={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST} component={PasswordResetInit}/>
      <ErrorBoundaryRoute path={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_FINISH} component={PasswordResetFinish}/>
      <PrivateRoute
        authenticationStore={props.authenticationStore}
        routing={props.routing}
        path={PAGE_ROUTE.ADMIN}
        component={AdminRouts}
        hasAnyAuthorities={[AUTHORITIES.ADMIN]}
      />
      <PrivateRoute
        exact
        authenticationStore={props.authenticationStore}
        routing={props.routing}
        path={PAGE_ROUTE.ACCOUNT_PASSWORD}
        component={AccountPassword}
        hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]}/>
      <PrivateRoute
        exact
        path={PAGE_ROUTE.ACCOUNT_SETTINGS}
        authenticationStore={props.authenticationStore}
        routing={props.routing}
        component={AccountPage}
        hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]}
      />
      <ErrorBoundaryRoute component={PageNotFound}/>
    </Switch>
  );
};
export default AppRouts;
