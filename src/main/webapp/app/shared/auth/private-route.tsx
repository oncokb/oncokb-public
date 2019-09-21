import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import ErrorBoundary from 'app/shared/error/error-boundary';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';

export interface IPrivateRouteProps extends RouteProps {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
  isAuthorized: boolean;
}

export const PrivateRoute = observer(({ component, authenticationStore, isAuthorized, routing, ...rest }: IPrivateRouteProps) => {
  const checkAuthorities = (props: RouteProps) =>
    isAuthorized ? (
      <ErrorBoundary>{React.createElement(component!, props)}</ErrorBoundary>
    ) : (
      <div className="insufficient-authority">
        <div className="alert alert-danger">You are not authorized to access this page.</div>
      </div>
    );

  const renderRedirect = (props: RouteProps) => {
    if (!authenticationStore.sessionHasBeenFetched) {
      return <div />;
    } else {
      return authenticationStore.isAuthenticated ? (
        checkAuthorities(props)
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            search: routing.location.search,
            state: { from: routing.location }
          }}
        />
      );
    }
  };

  if (!component) throw new Error(`A component needs to be specified for private route for path ${(rest as any).path}`);

  return <Route {...rest} render={renderRedirect} />;
});
