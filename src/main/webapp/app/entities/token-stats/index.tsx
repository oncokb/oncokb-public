import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import TokenStats from './token-stats';
import TokenStatsDetail from './token-stats-detail';
import TokenStatsUpdate from './token-stats-update';
import TokenStatsDeleteDialog from './token-stats-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={TokenStatsDeleteDialog} />
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={TokenStatsUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={TokenStatsUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={TokenStatsDetail} />
      <ErrorBoundaryRoute path={match.url} component={TokenStats} />
    </Switch>
  </>
);

export default Routes;
