import React from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { ONCOKB_CONTACT_EMAIL } from 'app/config/constants';
import { ContactLink } from 'app/shared/links/ContactLink';

export const SuggestCuration = (props: { suggestion: string }) => {
  return (
    <DefaultTooltip overlay={`Suggest to annotate ${props.suggestion}`}>
      <ContactLink
        emailSubject={`Annotation suggestion for ${props.suggestion}&&body=Thank you for using the feedback feature.%0APlease provide the following information for ${props.suggestion} curation:%0A%0AEvidence:%0APMIDs:%0AAbstracts:`}
        title={'suggest to annotate this gene'}
      >
        <i className="fa fa-envelope-o" aria-hidden="true" />
      </ContactLink>
    </DefaultTooltip>
  );
};
