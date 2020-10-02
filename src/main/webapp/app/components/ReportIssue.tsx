import React from 'react';
import { ContactLink } from 'app/shared/links/ContactLink';

export const ReportIssue: React.FunctionComponent<{}> = () => {
  return (
    <div style={{ fontSize: '0.9rem', color: 'grey' }}>
      <i>
        If you notice any mistakes or missing alterations / citations, please{' '}
        <ContactLink emailSubject={'OncoKB Feedback'} />.
      </i>
    </div>
  );
};
