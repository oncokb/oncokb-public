import React from 'react';
import { ErrorBoundaryRoute } from 'app/shared/error/error-boundary-route';
import { PAGE_ROUTE } from 'app/config/constants';
import { Switch } from 'react-router-dom';
import PageNotFound from 'app/shared/error/page-not-found';
import SendEmailsPage from 'app/pages/sendEmails/SendEmailsPage';
import UserDetailsPage from '../pages/userManagement/UserDetailsPage';
import { CreateAccountPage } from 'app/pages/CreateAccountPage';
import UsageAnalysisPage from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import UserUsageDetailsPage from 'app/pages/usageAnalysisPage/UserUsageDetailsPage';
import ResourceUsageDetailsPage from 'app/pages/usageAnalysisPage/ResourceUsageDetailsPage';
import { CreateCompanyPage } from 'app/pages/CreateCompanyPage';
import CompanyDetailsPage from 'app/pages/companyManagement/CompanyDetailsPage';
import ReadOnlyMode from 'app/shared/readonly/ReadOnlyMode';
import WindowStore from 'app/store/WindowStore';
import UserBannerPage from 'app/pages/userBannerManagement/UserBannerPage';
import CreateUserBannerMessagePage from 'app/pages/CreateUserBannerMessagePage';
import EditUserBannerMessagePage from 'app/pages/EditUserBannerMessagePage';

const AdminRoutes = ({ windowStore }: { windowStore: WindowStore }) => {
  return (
    <Switch>
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USER_DETAILS}
        component={UserDetailsPage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USAGE_ANALYSIS}
        component={UsageAnalysisPage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS}
        component={UserUsageDetailsPage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_RESOURCE_DETAILS}
        component={ResourceUsageDetailsPage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_SEND_EMAILS}
        component={ReadOnlyMode(SendEmailsPage)}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_CREATE_ACCOUNT}
        component={ReadOnlyMode(CreateAccountPage)}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_ADD_COMPANY}
        component={ReadOnlyMode(CreateCompanyPage)}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_ADD_USER_BANNER_MESSAGE}
        component={CreateUserBannerMessagePage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_EDIT_USER_BANNER_MESSAGE}
        component={EditUserBannerMessagePage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_COMPANY_DETAILS}
        component={CompanyDetailsPage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USER_BANNER_MESSAGES}
        component={UserBannerPage}
        windowStore={windowStore}
      />
      <ErrorBoundaryRoute component={PageNotFound} windowStore={windowStore} />
    </Switch>
  );
};
export default AdminRoutes;
