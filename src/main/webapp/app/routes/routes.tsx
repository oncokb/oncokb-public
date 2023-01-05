import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import Login from 'app/components/login/LoginPage';
import { Logout } from 'app/components/login/logout';
import { RegisterPage } from 'app/pages/RegisterPage';
import { PrivateRoute } from 'app/shared/auth/private-route';
import { AUTHORITIES, PAGE_ROUTE } from 'app/config/constants';
import HomePage from 'app/pages/HomePage';
import AuthenticationStore from 'app/store/AuthenticationStore';
import CancerGenesPage from 'app/pages/CancerGenesPage';
import ActionableGenesPage from 'app/pages/actionableGenesPage/ActionableGenesPage';
import { RouterStore } from 'mobx-react-router';
import GenePage from 'app/pages/genePage/GenePage';
import AlterationPage from 'app/pages/alterationPage/AlterationPage';
import { AccountPage } from 'app/pages/AccountPage';
import ActivateAccount from 'app/components/account/ActivateAccount';
import { PasswordResetInit } from 'app/components/account/PasswordResetInit';
import PasswordResetFinish from 'app/components/account/PasswordResetFinish';
import PageNotFound from 'app/shared/error/page-not-found';
import AccountPassword from 'app/components/account/AccountPassword';
import AdminRoutes from 'app/routes/AdminRoutes';
import PageContainer from 'app/components/PageContainer';
import React from 'react';
import LevelOfEvidencePage from 'app/pages/LevelOfEvidencePage';
import NewsPage from 'app/pages/newsPage/NewsPage';
import { RecaptchaBoundaryRoute } from '../shared/auth/RecaptchaBoundaryRoute';
import HgvsgPage from 'app/pages/hgvsgPage/HgvsgPage';
import UserPage from 'app/pages/userPage/UserPage';
import AppStore from 'app/store/AppStore';
import ActivateTrialFinish from 'app/components/account/ActivateTrialFinish';
import CompanyPage from 'app/pages/companyPage/CompanyPage';
import { CreateCompanyUsersPage } from 'app/pages/CreateCompanyUsersPage';
import { AboutPageNavTab } from 'app/pages/aboutGroup/AboutPageNavTab';
import { ApiAccessPageNavTab } from 'app/pages/apiAccessGroup/ApiAccessPageNavTab';
import FAQPage from 'app/pages/FAQPage';
import ReadOnlyMode from 'app/shared/readonly/ReadOnlyMode';

const AppRouts = (props: {
  authenticationStore: AuthenticationStore;
  appStore: AppStore;
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
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.LOGIN}
            component={Login}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.LOGOUT}
            component={Logout}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.REGISTER}
            component={ApiAccessPageNavTab}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.API_ACCESS}
            component={ApiAccessPageNavTab}
          />
          <ErrorBoundaryRoute
            exact
            path={PAGE_ROUTE.FAQ_ACCESS}
            component={FAQPage}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.CANCER_GENES}
            component={CancerGenesPage}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.ACTIONABLE_GENE}
            component={ActionableGenesPage}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.GENE}
            component={GenePage}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.ALTERATION}
            component={AlterationPage}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.HGVSG}
            component={HgvsgPage}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.ALTERATION_TUMOR_TYPE}
            component={AlterationPage}
          />
          <Route exact path={PAGE_ROUTE.ABOUT} component={AboutPageNavTab} />
          <Route exact path={PAGE_ROUTE.TEAM} component={AboutPageNavTab} />
          <Route exact path={PAGE_ROUTE.SOP} component={AboutPageNavTab} />
          <Route
            exact
            path={PAGE_ROUTE.YEAR_END_SUMMARY}
            component={AboutPageNavTab}
          />
          <Route exact path={PAGE_ROUTE.NEWS} component={NewsPage} />
          <Route
            exact
            path={PAGE_ROUTE.FDA_RECOGNITION}
            component={AboutPageNavTab}
          />
          <Route
            exact
            path={PAGE_ROUTE.TERMS}
            component={ApiAccessPageNavTab}
          />
          <Route
            exact
            path={PAGE_ROUTE.LEVELS}
            component={LevelOfEvidencePage}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.ACCOUNT_VERIFY}
            render={ReadOnlyMode(ActivateAccount)}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST}
            render={ReadOnlyMode(PasswordResetInit)}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={props.authenticationStore.isUserAuthenticated}
            appStore={props.appStore}
            path={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_FINISH}
            render={ReadOnlyMode(PasswordResetFinish)}
          />
          <RecaptchaBoundaryRoute
            exact
            isUserAuthenticated={false}
            appStore={props.appStore}
            path={PAGE_ROUTE.ACCOUNT_ACTIVE_TRIAL_FINISH}
            render={ReadOnlyMode(ActivateTrialFinish)}
          />
          <PrivateRoute
            authenticationStore={props.authenticationStore}
            routing={props.routing}
            path={PAGE_ROUTE.ADMIN}
            component={AdminRoutes}
            hasAnyAuthorities={[AUTHORITIES.ADMIN]}
          />
          <PrivateRoute
            exact
            authenticationStore={props.authenticationStore}
            routing={props.routing}
            path={PAGE_ROUTE.ACCOUNT_PASSWORD}
            render={ReadOnlyMode(AccountPassword)}
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
          <PrivateRoute
            exact
            path={PAGE_ROUTE.USER}
            authenticationStore={props.authenticationStore}
            routing={props.routing}
            render={ReadOnlyMode(UserPage, true)}
            hasAnyAuthorities={[AUTHORITIES.ADMIN]}
          />
          <PrivateRoute
            exact
            path={PAGE_ROUTE.COMPANY}
            authenticationStore={props.authenticationStore}
            routing={props.routing}
            render={ReadOnlyMode(CompanyPage, true)}
            hasAnyAuthorities={[AUTHORITIES.ADMIN]}
          />
          <PrivateRoute
            exact
            path={PAGE_ROUTE.CREATE_COMPANY_USERS}
            authenticationStore={props.authenticationStore}
            routing={props.routing}
            render={ReadOnlyMode(CreateCompanyUsersPage)}
            hasAnyAuthorities={[AUTHORITIES.ADMIN]}
          />
          <ErrorBoundaryRoute component={PageNotFound} />
        </Switch>
      </PageContainer>
    </Switch>
  );
};
export default AppRouts;
