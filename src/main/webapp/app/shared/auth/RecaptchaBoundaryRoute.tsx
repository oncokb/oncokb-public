import { RECAPTCHA_KEY } from 'app/indexUtils';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import React from 'react';
import { RouteProps } from 'react-router-dom';

export const RecaptchaBoundaryRoute = ({ ...props }: RouteProps) => {
  if (localStorage.getItem(RECAPTCHA_KEY)) {
    return <ErrorBoundaryRoute {...props} />;
  } else {
    return <div>Please identify yourself first then refresh the page.</div>;
  }
};
