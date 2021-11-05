import { LEVEL_TYPES, PAGE_ROUTE } from 'app/config/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { LEVEL_TYPE_TO_VERSION } from 'app/pages/LevelOfEvidencePage';
import { getLoEPageLink } from 'app/shared/utils/UrlUtils';

export const LevelOfEvidencePageLink: React.FunctionComponent<{
  levelType: LEVEL_TYPES;
}> = props => {
  return (
    <Link to={getLoEPageLink(LEVEL_TYPE_TO_VERSION[props.levelType])}>
      {props.children ? (
        props.children
      ) : (
        <span>OncoKB ${props.levelType} level of evidence</span>
      )}
    </Link>
  );
};
