import React from 'react';
import { RouteProps, Route, RouteComponentProps } from 'react-router';
import WindowStore from 'app/store/WindowStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import RegistrationHover from 'app/components/registrationHover/RegistrationHover';

export type OncokbRouteProps = RouteProps & {
  pageContainer?: React.FunctionComponent<{
    windowStore: WindowStore;
    children: JSX.Element;
  }>;
  windowStore: WindowStore;
  authenticationStore: AuthenticationStore;
  hasRegistrationLock?: boolean;
};

export default function OncokbRoute({
  render,
  component,
  windowStore,
  authenticationStore,
  pageContainer = props => props.children,
  hasRegistrationLock = false,
  ...rest
}: OncokbRouteProps) {
  const newRender = (props: RouteComponentProps) => {
    const newProps = { ...props, windowStore };
    return render ? (
      <>{render(newProps)}</>
    ) : (
      <>{React.createElement(component!, newProps)}</>
    );
  };
  const routeElement = <Route render={newRender} {...rest} />;
  const children = (
    <>
      {hasRegistrationLock && (
        <RegistrationHover authenticationStore={authenticationStore} />
      )}
      {routeElement}
    </>
  );

  return pageContainer({
    windowStore,
    children,
  });
}
