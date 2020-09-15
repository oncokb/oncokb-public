import { Redirect, Route, Switch } from 'react-router-dom';
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
import { TermsPage } from 'app/pages/TermsPage';
import { TeamPage } from 'app/pages/teamPage/TeamPage';
import CancerGenesPage from 'app/pages/CancerGenesPage';
import ActionableGenesPage from 'app/pages/ActionableGenesPage';
import { RouterStore } from 'mobx-react-router';
import GenePage from 'app/pages/genePage/GenePage';
import AlterationPage from 'app/pages/alterationPage/AlterationPage';
import { AccountPage } from 'app/pages/AccountPage';
import ActivateAccount from 'app/components/account/ActivateAccount';
import { PasswordResetInit } from 'app/components/account/PasswordResetInit';
import PasswordResetFinish from 'app/components/account/PasswordResetFinish';
import PageNotFound from 'app/shared/error/page-not-found';
import APIAccessPage from 'app/pages/APIAccessPage';
import AccountPassword from 'app/components/account/AccountPassword';
import AdminRouts from 'app/routes/AdminRoutes';
import PageContainer from 'app/components/PageContainer';
import React from 'react';
import LevelOfEvidencePage from 'app/pages/LevelOfEvidencePage';
import NewsPage from 'app/pages/newsPage/NewsPage';
import { FAQPage } from 'app/pages/FAQPage';

const AppRouts = (props: {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
}) => {
  // Redirect needs to be defined first
  return (
    <Switch>
      <Route exact path={PAGE_ROUTE.HOME} component={HomePage} />
      <Redirect exact from={'/updates'} to={PAGE_ROUTE.NEWS} />
      <Redirect exact from={'/genes'} to={PAGE_ROUTE.CANCER_GENES} />
      <Redirect
        exact
        from={PAGE_ROUTE.DATA_ACCESS}
        to={PAGE_ROUTE.API_ACCESS}
      />
      <Redirect
        exact
        from={'/gene/:hugoSymbol/alteration/:alteration'}
        to={PAGE_ROUTE.ALTERATION}
      />
      <Redirect
        exact
        from={'/gene/:hugoSymbol/variant/:alteration'}
        to={PAGE_ROUTE.ALTERATION}
      />
      <PageContainer>
        <Switch>
          <ErrorBoundaryRoute exact path={PAGE_ROUTE.LOGIN} component={Login} />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.LOGOUT}
            component={Logout}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.REGISTER}
            component={RegisterPage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.API_ACCESS}
            component={APIAccessPage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.FAQ_ACCESS}
            component={FAQPage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.CANCER_GENES}
            component={CancerGenesPage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.ACTIONABLE_GENE}
            component={ActionableGenesPage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.GENE}
            component={GenePage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.ALTERATION}
            component={AlterationPage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.ALTERATION_TUMOR_TYPE}
            component={AlterationPage}
          />
          <Route exact path={PAGE_ROUTE.ABOUT} component={AboutPage} />
          <Route exact path={PAGE_ROUTE.TERMS} component={TermsPage} />
          <Route exact path={PAGE_ROUTE.TEAM} component={TeamPage} />
          <Route exact path={PAGE_ROUTE.NEWS} component={NewsPage} />
          <Route
            exact
            path={PAGE_ROUTE.LEVELS}
            component={LevelOfEvidencePage}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.ACCOUNT_VERIFY}
            component={ActivateAccount}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST}
            component={PasswordResetInit}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_FINISH}
            component={PasswordResetFinish}
          />
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
            hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]}
          />
          <PrivateRoute
            exact
            path={PAGE_ROUTE.ACCOUNT_SETTINGS}
            authenticationStore={props.authenticationStore}
            routing={props.routing}
            component={AccountPage}
            hasAnyAuthorities={[AUTHORITIES.ADMIN, AUTHORITIES.USER]}
          />
          <ErrorBoundaryRoute component={PageNotFound} />
        </Switch>
      </PageContainer>
    </Switch>
  );
};
export default AppRouts;
