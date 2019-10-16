import React from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { ONCOKB_CONTACT_EMAIL } from 'app/config/constants';

export const SuggestCuration = (props: { suggestion: string }) => {
  return (
    <DefaultTooltip overlay={`Suggest to annotate ${props.suggestion}`}>
      <a
        href={`mailto:${ONCOKB_CONTACT_EMAIL}?subject=Annotation suggestion for {{suggestion}}&&body=Thank you for using the feedback feature.%0APlease provide the following information for {{suggestion}} curation:%0A%0AEvidence:%0APMIDs:%0AAbstracts:`}
        target="_blank"
        rel="noopener noreferrer"
        title="suggest to annotate this gene"
      >
        <i className="fa fa-envelope-o" aria-hidden="true" />
      </a>
    </DefaultTooltip>
  );
};
