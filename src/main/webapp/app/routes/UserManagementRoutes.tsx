import React from 'react';
import { ErrorBoundaryRoute } from 'app/shared/error/error-boundary-route';
import { Switch } from 'react-router-dom';
import { match as IMatch } from "react-router";
import UserManagementPage from 'app/pages/userManagement/UserManagementPage';

const UserManagementRoutes = ({ match } : {match:IMatch}) => {
  return (
    <>
      <Switch>
        {/* <ErrorBoundaryRoute exact path={`${match.url}/new`} component={UserManagementUpdate} />*/}
        {/* <ErrorBoundaryRoute exact path={`${match.url}/:login/edit`} component={UserManagementUpdate} />*/}
        {/* <ErrorBoundaryRoute exact path={`${match.url}/:login`} component={UserManagementDetail} />*/}
        <ErrorBoundaryRoute path={match.url} component={UserManagementPage} />
      </Switch>
      {/* <ErrorBoundaryRoute path={`${match.url}/:login/delete`} component={UserManagementDeleteDialog} />*/}
    </>
  );
};
export default UserManagementRoutes;
