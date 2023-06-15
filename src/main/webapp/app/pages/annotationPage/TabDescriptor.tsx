import React from 'react';
import {LEVEL_TYPES, PAGE_ROUTE} from 'app/config/constants';
import {Version} from 'app/pages/LevelOfEvidencePage';
import {LevelOfEvidencePageLink} from "app/shared/links/LevelOfEvidencePageLink";

export const FdaTabDescription: React.FunctionComponent<{
  hugoSymbol: string;
}> = props => {
  return (
    <span>
      A list of the tumor type-specific {props.hugoSymbol} alterations and the
      corresponding{' '}
      <LevelOfEvidencePageLink levelType={LEVEL_TYPES.FDA}>
        FDA Level of Evidence
      </LevelOfEvidencePageLink>{' '}
      assigning their clinical significance. The assigned{' '}
      <LevelOfEvidencePageLink levelType={LEVEL_TYPES.TX} version={Version.FDA}>
         FDA level of evidence
      </LevelOfEvidencePageLink>{' '}
      is based on these alterations being tested in Formalin Fixed Paraffin
      Embedded (FFPE) specimen types, except in cases where specimen type is not
      specified.
    </span>
  );
};
