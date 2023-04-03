import React from 'react';
import { PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';
import { Version } from 'app/pages/LevelOfEvidencePage';

export const FdaTabDescription: React.FunctionComponent<{
  hugoSymbol: string;
}> = props => {
  return (
    <span>
      A list of the tumor type-specific {props.hugoSymbol} alterations and the
      corresponding{' '}
      <Link to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA_NGS}`}>
        FDA Level of Evidence
      </Link>{' '}
      assigning their clinical significance. The assigned{' '}
      <Link to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA}`}>
        FDA level of evidence
      </Link>{' '}
      is based on these alterations being tested in Formalin Fixed Paraffin
      Embedded (FFPE) specimen types, except in cases where specimen type is not
      specified.
    </span>
  );
};
