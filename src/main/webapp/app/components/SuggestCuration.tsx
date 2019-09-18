import React from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

export const SuggestCuration = (props: { suggestion: string }) => {
  return (
    <DefaultTooltip overlay={`Suggest to annotate ${props.suggestion}`}>
      <a
        href="mailto:contact@oncokb.org?subject=Annotation suggestion for {{suggestion}}&&body=Thank you for using the feedback feature.%0APlease provide the following information for {{suggestion}} curation:%0A%0AEvidence:%0APMIDs:%0AAbstracts:"
        target="_blank"
        title="suggest to annotate this gene"
      >
        <i className="fa fa-envelope-o" aria-hidden="true" />
      </a>
    </DefaultTooltip>
  );
};
