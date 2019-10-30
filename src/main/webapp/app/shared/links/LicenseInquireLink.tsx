import React from 'react';
import { ONCOKB_LICENSE_EMAIL, PAGE_ROUTE } from 'app/config/constants';

export const LicenseInquireLink: React.FunctionComponent<{}> = props => {
  const title = 'License Inquiry';
  return (
    <a href={`mailto:${ONCOKB_LICENSE_EMAIL}?subject=${title}`} target="_blank" rel="noopener noreferrer" title={title}>
      {props.children ? props.children : ONCOKB_LICENSE_EMAIL}
    </a>
  );
};
