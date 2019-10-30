import React from 'react';
import {
  ONCOKB_CONTACT_EMAIL,
  ONCOKB_LICENSE_EMAIL,
  PAGE_ROUTE
} from 'app/config/constants';

export const ContactLink: React.FunctionComponent<{
  emailSubject: string;
  title?: string;
}> = props => {
  return (
    <a
      href={`mailto:${ONCOKB_CONTACT_EMAIL}?subject=${props.emailSubject}`}
      target="_blank"
      rel="noopener noreferrer"
      title={props.title ? props.title : props.emailSubject}
    >
      {props.children ? props.children : ONCOKB_CONTACT_EMAIL}
    </a>
  );
};
