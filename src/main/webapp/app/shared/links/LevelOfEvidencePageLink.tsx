import {
  LEVEL_TYPES,
  ONCOKB_TM,
  PAGE_ROUTE,
  PAGE_TITLE,
} from 'app/config/constants';
import React from 'react';
import { Link } from 'react-router-dom';
import { Version } from 'app/pages/LevelOfEvidencePage';

const getLevelPageLink = (levelType: LEVEL_TYPES, version?: Version) => {
  let levelLink = '';
  switch (levelType) {
    case LEVEL_TYPES.TX:
      levelLink = PAGE_ROUTE.V2;
      break;
    case LEVEL_TYPES.DX:
      levelLink = PAGE_ROUTE.DX;
      break;
    case LEVEL_TYPES.PX:
      levelLink = PAGE_ROUTE.PX;
      break;
    case LEVEL_TYPES.FDA:
      levelLink = PAGE_ROUTE.FDA_NGS;
      break;
    default:
      break;
  }
  if (version) {
    levelLink = `${levelLink}#version=${version}`;
  }
  return levelLink;
};

const getDefaultLinkContent = (levelType: LEVEL_TYPES, version?: Version) => {
  let content = '';
  switch (levelType) {
    case LEVEL_TYPES.TX:
      content = PAGE_TITLE.V2;
      if (version) {
        switch (version) {
          case Version.AAC:
            content = PAGE_TITLE.AAC;
            break;
          case Version.FDA:
            content = PAGE_TITLE.FDA;
            break;
          case Version.V1:
            content = PAGE_TITLE.V1;
            break;
          default:
            break;
        }
      }
      break;
    case LEVEL_TYPES.DX:
      content = PAGE_TITLE.V2;
      break;
    case LEVEL_TYPES.PX:
      content = PAGE_TITLE.V2;
      break;
    case LEVEL_TYPES.FDA:
      content = PAGE_TITLE.FDA_NGS;
      break;
    default:
      content = 'level of evidence';
      break;
  }
  return content;
};

export const LevelOfEvidencePageLink: React.FunctionComponent<{
  levelType: LEVEL_TYPES;
  version?: Version;
}> = props => {
  return (
    <Link to={getLevelPageLink(props.levelType, props.version)}>
      {props.children ? (
        props.children
      ) : (
        <span>{getDefaultLinkContent(props.levelType, props.version)}</span>
      )}
    </Link>
  );
};
