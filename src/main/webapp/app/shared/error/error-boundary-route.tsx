import React from 'react';
import { Route, RouteProps } from 'react-router-dom';
import ErrorBoundary from 'app/shared/error/error-boundary';

export const ErrorBoundaryRoute = ({ component, ...rest }: RouteProps) => {
  const encloseInErrorBoundary = (props: any) => <ErrorBoundary>{React.createElement(component!, props)}</ErrorBoundary>;

  if (!component) throw new Error(`A component needs to be specified for path ${(rest as any).path}`);

  return <Route {...rest} render={encloseInErrorBoundary} />;
};

export default ErrorBoundaryRoute;
