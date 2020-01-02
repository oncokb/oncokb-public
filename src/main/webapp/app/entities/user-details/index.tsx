import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import UserDetails from './user-details';
import UserDetailsDetail from './user-details-detail';
import UserDetailsUpdate from './user-details-update';
import UserDetailsDeleteDialog from './user-details-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={UserDetailsDeleteDialog} />
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={UserDetailsUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={UserDetailsUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={UserDetailsDetail} />
      <ErrorBoundaryRoute path={match.url} component={UserDetails} />
    </Switch>
  </>
);

export default Routes;
