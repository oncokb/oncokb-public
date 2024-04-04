import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import ErrorBoundary from 'app/shared/error/error-boundary';
import OncokbRoute, { OncokbRouteProps } from '../route/OncokbRoute';

export const ErrorBoundaryRoute = ({
  component,
  render,
  ...rest
}: OncokbRouteProps) => {
  const encloseInErrorBoundary = (props: RouteComponentProps) => (
    <ErrorBoundary>
      {render ? <>{render(props)}</> : React.createElement(component!, props)}
    </ErrorBoundary>
  );

  if (!component && !render)
    throw new Error(
      `A component needs to be specified for path ${(rest as any).path}`
    );

  return <OncokbRoute {...rest} render={encloseInErrorBoundary} />;
};

export default ErrorBoundaryRoute;
