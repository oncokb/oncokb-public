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

const AdminRouts = () => {
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
        component={SendEmailsPage}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_CREATE_ACCOUNT}
        component={CreateAccountPage}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_ADD_COMPANY}
        component={CreateCompanyPage}
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
export default AdminRouts;
