import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';
import { observer } from 'mobx-react';
import React from 'react';
import { RouteProps } from 'react-router-dom';
import { ContactLink } from '../links/ContactLink';

export interface IRecaptchaBoundaryRoute extends RouteProps {
  isUserAuthenticated: boolean;
  recaptchaVerified: boolean;
}

@observer
export class RecaptchaBoundaryRoute extends React.Component<
  IRecaptchaBoundaryRoute
> {
  render() {
    if (this.props.isUserAuthenticated) {
      return <ErrorBoundaryRoute {...this.props} />;
    } else {
      if (!this.props.recaptchaVerified) {
        return (
          <>
            <div>
              <h3 style={{ textAlign: 'center' }}>
                Verifying your identity using Google reCAPTCHA...
              </h3>
              <p style={{ textAlign: 'center' }}>
                Please refresh if there is no response after few seconds.
              </p>
              <p style={{ textAlign: 'center' }}>
                If you continue seeing this language after refreshing, please{' '}
                <ContactLink emailSubject={'Unable to Access the Pages'}>
                  contact us
                </ContactLink>
                .
              </p>
            </div>
          </>
        );
      }
    }
    return <ErrorBoundaryRoute {...this.props} />;
  }
}
