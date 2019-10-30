import React from 'react';
import { ErrorBoundaryRoute } from 'app/shared/error/error-boundary-route';
import { PAGE_ROUTE } from 'app/config/constants';
import UserManagementPage from 'app/pages/userManagement/UserManagementPage';

const AdminRouts = () => {
  return (
    <>
      <ErrorBoundaryRoute path={PAGE_ROUTE.ADMIN_USER_MANAGEMENT} component={UserManagementPage} />
    </>
  );
};
export default AdminRouts;
