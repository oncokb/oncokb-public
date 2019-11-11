import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { observer } from 'mobx-react';
import ErrorBoundary from 'app/shared/error/error-boundary';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { RouterStore } from 'mobx-react-router';
import { PAGE_ROUTE } from 'app/config/constants';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { getRedirectLoginState } from 'app/shared/utils/Utils';

export interface IPrivateRouteProps extends RouteProps {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
  hasAnyAuthorities?: string[];
}

export const PrivateRoute = observer(
  ({
    component,
    authenticationStore,
    hasAnyAuthorities,
    routing,
    ...rest
  }: IPrivateRouteProps) => {
    const userAuthorities = authenticationStore.account
      ? authenticationStore.account.authorities
      : [];
    const userIsAuthorized = hasAnyAuthorities
      ? isAuthorized(userAuthorities, hasAnyAuthorities)
      : true;
    const checkAuthorities = (props: RouteProps) =>
      userIsAuthorized ? (
        <ErrorBoundary>{React.createElement(component!, props)}</ErrorBoundary>
      ) : (
        <div className="insufficient-authority">
          <div className="alert alert-danger">
            You are not authorized to access this page.
          </div>
        </div>
      );

    const renderRedirect = (props: RouteProps) => {
      if (authenticationStore.isUserAuthenticated) {
        return checkAuthorities(props);
      } else {
        return (
          <Redirect
            to={{
              state: getRedirectLoginState(routing.location.pathname),
              pathname: PAGE_ROUTE.LOGIN
            }}
          />
        );
      }
    };

    if (!component)
      throw new Error(
        `A component needs to be specified for private route for path ${
          (rest as any).path
        }`
      );

    return <Route {...rest} render={renderRedirect} />;
  }
);
