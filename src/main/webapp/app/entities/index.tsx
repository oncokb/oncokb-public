import React from 'react';
import { Switch } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Token from './token';
import TokenStats from './token-stats';
import UserDetails from './user-details';
/* jhipster-needle-add-route-import - JHipster will add routes here */

const Routes = ({ match }) => (
  <div>
    <Switch>
      {/* prettier-ignore */}
      <ErrorBoundaryRoute path={`${match.url}/token`} component={Token} />
      <ErrorBoundaryRoute path={`${match.url}/token-stats`} component={TokenStats} />
      <ErrorBoundaryRoute path={`${match.url}/user-details`} component={UserDetails} />
      {/* jhipster-needle-add-route-path - JHipster will add routes here */}
    </Switch>
  </div>
);

export default Routes;
