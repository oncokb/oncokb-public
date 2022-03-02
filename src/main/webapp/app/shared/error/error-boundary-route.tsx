import React from 'react';
import { Route, RouteProps, RouteComponentProps } from 'react-router-dom';
import ErrorBoundary from 'app/shared/error/error-boundary';

export const ErrorBoundaryRoute = ({
  component,
  render,
  ...rest
}: RouteProps) => {
  const encloseInErrorBoundary = (props: RouteComponentProps) => (
    <ErrorBoundary>
      {render ? <>{render(props)}</> : React.createElement(component!, props)}
    </ErrorBoundary>
  );

  if (!component && !render)
    throw new Error(
      `A component needs to be specified for path ${(rest as any).path}`
    );

  return <Route {...rest} render={encloseInErrorBoundary} />;
};

export default ErrorBoundaryRoute;
