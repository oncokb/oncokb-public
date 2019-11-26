import { PAGE_ROUTE } from 'app/config/constants';
import React from 'react';
import { Link } from 'react-router-dom';

export const OncoKBLink: React.FunctionComponent<{}> = () => {
  return <Link to={PAGE_ROUTE.HOME}>https://www.oncokb.org</Link>;
};
