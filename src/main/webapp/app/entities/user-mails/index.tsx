import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import UserMails from './user-mails';
import UserMailsDetail from './user-mails-detail';
import UserMailsUpdate from './user-mails-update';
import UserMailsDeleteDialog from './user-mails-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/:id/delete`} component={UserMailsDeleteDialog} />
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={UserMailsUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={UserMailsUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={UserMailsDetail} />
      <ErrorBoundaryRoute path={match.url} component={UserMails} />
    </Switch>
  </>
);

export default Routes;
