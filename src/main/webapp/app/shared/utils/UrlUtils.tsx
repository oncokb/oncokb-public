import { Link } from 'react-router-dom';
import React from 'react';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_REFERENCE_GENOME,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  REGEXP,
  REGEXP_LINK,
  SEARCH_QUERY_KEY,
  YOUTUBE_VIDEO_IDS,
} from 'app/config/constants';
import _ from 'lodash';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import reactStringReplace from 'react-string-replace';
import { ReactNodeArray } from 'prop-types';
import { encodeSlash, getYouTubeLink } from 'app/shared/utils/Utils';
import { Linkout } from 'app/shared/links/Linkout';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import {
  AlterationPageHashQueries,
  AlterationPageSearchQueries,
  GenePageHashQueries,
  GenePageSearchQueries,
} from 'app/shared/route/types';
import * as QueryString from 'querystring';
import { LEVEL_TYPE_TO_VERSION, Version } from 'app/pages/LevelOfEvidencePage';

export const GenePageLink: React.FunctionComponent<{
  hugoSymbol: string;
  content?: string;
  highlightContent?: boolean;
  searchQueries?: GenePageSearchQueries;
  hashQueries?: GenePageHashQueries;
  onClick?: () => void;
}> = props => {
  const highlightContent =
    props.highlightContent === undefined ? true : props.highlightContent;
  let pageLink = `${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}`;
  if (props.searchQueries && Object.keys(props.searchQueries).length > 0) {
    pageLink = `${pageLink}?${QueryString.stringify(props.searchQueries)}`;
  }
  if (props.hashQueries) {
    pageLink = `${pageLink}#${QueryString.stringify(props.hashQueries)}`;
  }

  return (
    <Link
      style={{ color: highlightContent ? undefined : 'black' }}
      to={pageLink}
      onClick={props.onClick}
    >
      {props.content ? props.content : props.hugoSymbol}
    </Link>
  );
};

export const AlterationPageLink: React.FunctionComponent<{
  hugoSymbol: string;
  alteration: string;
  alterationRefGenomes?: REFERENCE_GENOME[];
  searchQueries?: AlterationPageSearchQueries;
  hashQueries?: AlterationPageHashQueries;
  showGene?: boolean;
  content?: string;
  onClick?: () => void;
}> = props => {
  let pageLink = `${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}/${props.alteration}`;
  const searchQueries = props.searchQueries || {};

  // Prop alterationRefGenomes is just a convinient way to process reference genomes when it's a list.
  if (!searchQueries.refGenome && props.alterationRefGenomes) {
    if (!props.alterationRefGenomes.includes(DEFAULT_REFERENCE_GENOME)) {
      searchQueries.refGenome = props.alterationRefGenomes[0];
    }
  }
  if (Object.keys(searchQueries).length > 0) {
    pageLink = `${pageLink}?${QueryString.stringify(searchQueries)}`;
  }
  if (props.hashQueries) {
    pageLink = `${pageLink}#${QueryString.stringify(props.hashQueries)}`;
  }
  return (
    <Link to={pageLink} onClick={props.onClick}>
      {props.content
        ? props.content
        : props.showGene
        ? `${props.hugoSymbol} ${props.alteration}`
        : props.alteration}
    </Link>
  );
};

export const TumorTypePageLink: React.FunctionComponent<{
  hugoSymbol: string;
  alteration: string;
  tumorType: string;
  content?: string;
}> = props => {
  return (
    <Link
      to={`${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}/${encodeSlash(
        props.alteration
      )}/${encodeSlash(props.tumorType)}`}
    >
      {props.content ? props.content : props.tumorType}
    </Link>
  );
};

export const MSILink: React.FunctionComponent<{}> = () => {
  return (
    <AlterationPageLink
      hugoSymbol={'Other Biomarkers'}
      alteration={'MSI-H'}
      content={'microsatellite instability high (MSI-H)'}
    />
  );
};

export const CitationLink: React.FunctionComponent<{
  content: string;
}> = props => {
  const regexps = [REGEXP.PMID, REGEXP.NCTID];
  let contentWithLink: ReactNodeArray = [props.content];
  _.forEach(regexps, regexp => {
    contentWithLink = reactStringReplace(
      contentWithLink,
      new RegExp(regexp, 'ig'),
      (match, i) => {
        switch (regexp) {
          case REGEXP.PMID: {
            return <PMIDLink pmids={match} />;
            break;
          }
          case REGEXP.NCTID:
            return (
              <a
                href={`${REGEXP_LINK[regexp]}${match}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                ${match}
              </a>
            );
            break;
          default:
            return match;
            break;
        }
      }
    );
  });
  return <div>{contentWithLink}</div>;
};

export const OncoTreeLink: React.FunctionComponent<{}> = props => {
  return (
    <Linkout link={'http://oncotree.info'}>
      OncoTree <ExternalLinkIcon />
    </Linkout>
  );
};

export const WebinarLink: React.FunctionComponent<{}> = props => {
  return (
    <span>
      <Linkout
        link={getYouTubeLink('regular', YOUTUBE_VIDEO_IDS.WEBINAR_INTRO)}
      >
        YouTube.com
      </Linkout>{' '}
      or{' '}
      <Linkout link={'https://www.bilibili.com/video/BV1pZ4y1s7ou'}>
        bilibili.com
      </Linkout>
    </span>
  );
};

export const getLoEPageLink = (version: Version) => {
  return `${PAGE_ROUTE.LEVELS}#version=${version}`;
};
