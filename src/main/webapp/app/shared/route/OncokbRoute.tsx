import React, { useEffect } from 'react';
import { RouteProps, Route, RouteComponentProps } from 'react-router';

type CanonicalLinkProps = { routeProps: RouteComponentProps };

function CanonicalLink({ routeProps }: CanonicalLinkProps) {
  useEffect(() => {
    const canonicalEndpoint = routeProps.location.pathname;
    const linkNode = document.createElement('link');

    linkNode.setAttribute('id', 'canonical');
    linkNode.setAttribute('rel', 'canonical');
    linkNode.setAttribute(
      'href',
      `${location.protocol}${location.host}${canonicalEndpoint}`
    );

    document.head.appendChild(linkNode);

    return () => {
      document.head.removeChild(linkNode);
    };
  }, [routeProps]);
  return <></>;
}

export type OncokbRouteProps = RouteProps & {
  addCanonicalLink?: boolean;
};

export default function OncokbRoute({
  render,
  component,
  addCanonicalLink = false,
  ...rest
}: OncokbRouteProps) {
  const newRender = (props: RouteComponentProps) => {
    return render ? (
      <>
        {render(props)}
        {addCanonicalLink && <CanonicalLink routeProps={props} />}
      </>
    ) : (
      <>
        {React.createElement(component!, props)}

        {addCanonicalLink && <CanonicalLink routeProps={props} />}
      </>
    );
  };
  return <Route render={newRender} {...rest} />;
}
