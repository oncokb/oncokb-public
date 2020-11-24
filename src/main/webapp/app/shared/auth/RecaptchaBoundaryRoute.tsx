import { RECAPTCHA_KEY } from 'app/indexUtils';
import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import React from 'react';
import { RouteProps } from 'react-router-dom';
import { ContactLink } from '../links/ContactLink';

export interface IRecaptchaBoundaryRoute extends RouteProps {
  isUserAuthenticated: boolean;
}

export const RecaptchaBoundaryRoute = ({
  isUserAuthenticated,
  ...props
}: IRecaptchaBoundaryRoute) => {
  if (isUserAuthenticated || localStorage.getItem(RECAPTCHA_KEY)) {
    return <ErrorBoundaryRoute {...props} />;
  } else {
    return (
      <>
        <div>
          Please try to refresh your page, if you continue seeing this language
          please{' '}
          <ContactLink emailSubject={'Unable to Access the Pages'}>
            contact us
          </ContactLink>
          .
        </div>
      </>
    );
  }
};
