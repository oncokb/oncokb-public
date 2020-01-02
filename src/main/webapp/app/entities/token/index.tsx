import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Token from './token';
import TokenDetail from './token-detail';
import TokenUpdate from './token-update';
import TokenDeleteDialog from './token-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={TokenDeleteDialog} />
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={TokenUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={TokenUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={TokenDetail} />
      <ErrorBoundaryRoute path={match.url} component={Token} />
    </Switch>
  </>
);

export default Routes;
