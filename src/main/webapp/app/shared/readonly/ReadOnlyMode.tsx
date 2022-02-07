import { AppConfig } from 'app/appConfig';
import React from 'react';
import { Alert } from 'react-bootstrap';
import ReadOnlyPage from './ReadOnlyPage';

// Todo:
// We now have multiple types of routes (RecaptchaBoundaryRoute, PrivateRoute, and now a read only route)
// We can combine these routes into a general route component and just specify the route type(s).

/**
 * Components wrapped in the HOC will display a warning page or have a warning message added to the page
 * when application is in read only mode.
 * @param Component the original component
 * @param showWarningOnly if true and app is in read only mode, then the original component
 * will be displayed and a warning message will be added to the top of the page.
 */

export default function ReadOnlyMode(
  Component: React.ComponentType,
  showWarningOnly?: boolean
) {
  return (props: any) => {
    if (AppConfig.serverConfig.readonly) {
      if (showWarningOnly) {
        return (
          <>
            <Alert variant="danger">
              <h4>This page is read-only</h4>
              <div>
                Any changes you make will NOT be saved at this time. The page
                will be back shortly.
              </div>
            </Alert>
            <Component {...props} />
          </>
        );
      }
      return <ReadOnlyPage />;
    }
    return <Component {...props} />;
  };
}
