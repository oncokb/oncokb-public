import { ContactLink } from 'app/shared/links/ContactLink';
import React from 'react';

const MessageToContact: React.FunctionComponent<{
  emailTitle?: string;
  className?: string;
}> = props => {
  return (
    <div className={props.className}>
      Please do not hesitate to{' '}
      <ContactLink emailSubject={props.emailTitle ? props.emailTitle : ''}>
        contact us
      </ContactLink>{' '}
      with any questions.
    </div>
  );
};

export default MessageToContact;
