import React from 'react';
import { ErrorBoundaryRoute } from 'app/shared/error/error-boundary-route';
import { PAGE_ROUTE } from 'app/config/constants';
import UserManagementPage from 'app/pages/userManagement/UserManagementPage';
import { Switch } from 'react-router-dom';
import { PrivateRoute } from 'app/shared/auth/private-route';
import PageNotFound from 'app/shared/error/page-not-found';
import SendEmailsPage from "app/pages/sendEmails/SendEmailsPage";

const AdminRouts = () => {
  return (
    <Switch>
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_USER_MANAGEMENT}
        component={UserManagementPage}
      />
      <ErrorBoundaryRoute
        exact
        path={PAGE_ROUTE.ADMIN_SEND_EMAILS}
        component={SendEmailsPage}
      />
      <ErrorBoundaryRoute component={PageNotFound} />
    </Switch>
  );
};
export default AdminRouts;
