import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import { observer } from 'mobx-react';
import React from 'react';
import { RouteProps } from 'react-router-dom';
import { ContactLink } from '../links/ContactLink';
import AppStore from 'app/store/AppStore';

export interface IRecaptchaBoundaryRoute extends RouteProps {
  isUserAuthenticated: boolean;
  appStore: AppStore;
}

@observer
export class RecaptchaBoundaryRoute extends React.Component<
  IRecaptchaBoundaryRoute
> {
  render() {
    return <ErrorBoundaryRoute {...this.props} />;
  }
}
