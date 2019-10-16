import React from 'react';
import { ONCOKB_CONTACT_EMAIL } from 'app/config/constants';

export const ReportIssue: React.FunctionComponent<{}> = () => {
  return (
    <div>
      <i>
        If you notice any mistakes or missing alterations / citations, please send an email to{' '}
        <a href={`mailto:${ONCOKB_CONTACT_EMAIL}?subject=OncoKB Feedback`}>{ONCOKB_CONTACT_EMAIL}.</a>
      </i>
    </div>
  );
};
