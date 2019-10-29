import React from 'react';
import { ONCOKB_LICENSE_EMAIL, PAGE_ROUTE } from 'app/config/constants';

export const LicenseInquireLink: React.FunctionComponent<{ content?: string }> = (props) => {
  const title = 'License Inquiry';
  return (
    <a
      href={`mailto:${ONCOKB_LICENSE_EMAIL}?subject=${title}`}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >
      {props.content ? props.content : ONCOKB_LICENSE_EMAIL}
    </a>
  );
};
