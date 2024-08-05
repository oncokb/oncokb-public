import React, { lazy } from 'react';
import { ErrorBoundaryRoute } from 'app/shared/error/error-boundary-route';
import { PAGE_ROUTE } from 'app/config/constants';
import { Switch } from 'react-router-dom';
import PageNotFound from 'app/shared/error/page-not-found';
const SendEmailsPage = lazy(
  () => import('app/pages/sendEmails/SendEmailsPage')
);
const UserDetailsPage = lazy(
  () => import('../pages/userManagement/UserDetailsPage')
);
import { CreateAccountPage } from 'app/pages/CreateAccountPage';
const UsageAnalysisPage = lazy(
  () => import('app/pages/usageAnalysisPage/UsageAnalysisPage')
);
const UserUsageDetailsPage = lazy(
  () => import('app/pages/usageAnalysisPage/UserUsageDetailsPage')
);
const ResourceUsageDetailsPage = lazy(
  () => import('app/pages/usageAnalysisPage/ResourceUsageDetailsPage')
);
import { CreateCompanyPage } from 'app/pages/CreateCompanyPage';
const CompanyDetailsPage = lazy(
  () => import('app/pages/companyManagement/CompanyDetailsPage')
);
import ReadOnlyMode from 'app/shared/readonly/ReadOnlyMode';

const AdminRoutes = () => {
  return (
    <Switch>
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USER_DETAILS}
        component={UserDetailsPage}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USAGE_ANALYSIS}
        component={UsageAnalysisPage}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS}
        component={UserUsageDetailsPage}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_RESOURCE_DETAILS}
        component={ResourceUsageDetailsPage}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_SEND_EMAILS}
        component={ReadOnlyMode(SendEmailsPage)}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_CREATE_ACCOUNT}
        component={ReadOnlyMode(CreateAccountPage)}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_ADD_COMPANY}
        component={ReadOnlyMode(CreateCompanyPage)}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_COMPANY_DETAILS}
        component={CompanyDetailsPage}
      />
      <ErrorBoundaryRoute component={PageNotFound} />
    </Switch>
  );
};
export default AdminRoutes;
