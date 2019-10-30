import { ContactLink } from 'app/shared/links/ContactLink';
import React from 'react';

const MessageToContact: React.FunctionComponent<{
  emailTitle?: string
}> = (props) => {
  return (
    <div>
      Please don&apos;t hesitate to{' '}
      <ContactLink emailSubject={props.emailTitle ? props.emailTitle : ''}>contact us</ContactLink> for any issues you
      encountered.
    </div>
  );
};

export default MessageToContact;
