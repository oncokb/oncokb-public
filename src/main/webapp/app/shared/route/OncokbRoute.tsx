import React from 'react';
import { RouteProps, Route, RouteComponentProps } from 'react-router';
import PageContainer from 'app/components/PageContainer';
import WindowStore from 'app/store/WindowStore';

export type OncokbRouteProps = RouteProps & {
  pageContainer?: (props: {
    windowStore: WindowStore;
    children: JSX.Element;
  }) => JSX.Element;
  windowStore: WindowStore;
};

export default function OncokbRoute({
  render,
  component,
  windowStore,
  pageContainer = props => <PageContainer {...props} />,
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
  return pageContainer({
    windowStore,
    children: <Route render={newRender} {...rest} />,
  });
}
