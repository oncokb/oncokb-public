import { LEVEL_TYPES, PAGE_ROUTE } from 'app/config/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { LEVEL_TYPE_TO_VERSION } from 'app/pages/LevelOfEvidencePage';

export const LevelOfEvidencePageLink: React.FunctionComponent<{
  levelType: LEVEL_TYPES;
}> = props => {
  return (
    <Link
      to={`${PAGE_ROUTE.LEVELS}#version=${
        LEVEL_TYPE_TO_VERSION[props.levelType]
      }`}
    >
      {props.children ? (
        props.children
      ) : (
        <span>OncoKB ${props.levelType} level of evidence</span>
      )}
    </Link>
  );
};
