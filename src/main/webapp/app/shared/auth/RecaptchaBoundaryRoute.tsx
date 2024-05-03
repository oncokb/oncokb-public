import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import { observer } from 'mobx-react';
import React from 'react';
import AppStore from 'app/store/AppStore';
import { OncokbRouteProps } from '../route/OncokbRoute';

export interface IRecaptchaBoundaryRoute extends OncokbRouteProps {
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
