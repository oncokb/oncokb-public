import React, { useEffect } from 'react';
import { RouteProps, Route, RouteComponentProps } from 'react-router';

type CanonicalLinkPropsConfig =
  | {
      __canonicalTypeName: 'location-without-url-params';
    }
  | {
      __canonicalTypeName: 'function';
      getCanonicalEndpoint: (
        routeProps: RouteComponentProps,
        removedPropsUrl: string
      ) => string;
    }
  | {
      __canonicalTypeName: 'location';
    }
  | { __canonicalTypeName?: undefined };
type CanonicalLinkProps = { routeProps: RouteComponentProps } & {
  canonicalProps: CanonicalLinkPropsConfig | undefined;
};

function CanonicalLink({ routeProps, canonicalProps }: CanonicalLinkProps) {
  useEffect(() => {
    if (!canonicalProps) return;
    const removedPropsUrl = routeProps.match.path.replace(/\/:.*/, '');
    const canonicalEndpoint =
      /*
       * copies the entire URL and uses it as the canonical link
       */
      canonicalProps.__canonicalTypeName === 'location'
        ? routeProps.location.pathname
        : /*
         * allows to build the canonical URL based on the information
         * provided by react router.
         */
        canonicalProps.__canonicalTypeName === 'function'
        ? canonicalProps.getCanonicalEndpoint(routeProps, removedPropsUrl)
        : /*
         * strips the URL parameters from the URL for example:
         * /gene/:hugoSymbol/:alteration
         * becomes
         * /gene
         */
        canonicalProps.__canonicalTypeName === 'location-without-url-params'
        ? removedPropsUrl
        : undefined;

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
  }, [routeProps, canonicalProps]);
  return <></>;
}

export type OncokbRouteProps = RouteProps & {
  canonicalProps?: CanonicalLinkPropsConfig;
};

export default function OncokbRoute({
  render,
  component,
  canonicalProps,
  ...rest
}: OncokbRouteProps) {
  const newRender = (props: RouteComponentProps) => {
    return render ? (
      <>
        {render(props)}
        <CanonicalLink routeProps={props} canonicalProps={canonicalProps} />
      </>
    ) : (
      <>
        {React.createElement(component!, props)}

        <CanonicalLink routeProps={props} canonicalProps={canonicalProps} />
      </>
    );
  };
  return <Route render={newRender} {...rest} />;
}
