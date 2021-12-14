import { Link } from 'react-router-dom';
import React from 'react';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_REFERENCE_GENOME,
  DELETION,
  FUSIONS,
  LEVEL_CLASSIFICATION,
  LEVELS,
  ONCOGENIC_MUTATIONS,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  REGEXP,
  REGEXP_LINK,
  SEARCH_QUERY_KEY,
  SOP_LINK,
  TRUNCATING_MUTATIONS,
  YOUTUBE_VIDEO_IDS,
} from 'app/config/constants';
import _ from 'lodash';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import reactStringReplace from 'react-string-replace';
import { ReactNodeArray } from 'prop-types';
import {
  encodeSlash,
  getAlterationName,
  getCategoricalAlterationDescription,
  getYouTubeLink,
  IAlteration,
} from 'app/shared/utils/Utils';
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
import { EnsemblGene } from 'app/shared/api/generated/OncoKbPrivateAPI';
import InfoIcon from 'app/shared/icons/InfoIcon';

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
  alteration: IAlteration | string;
  alterationRefGenomes?: REFERENCE_GENOME[];
  cancerType?: string;
  searchQueries?: AlterationPageSearchQueries;
  hashQueries?: AlterationPageHashQueries;
  showGene?: boolean;
  onClick?: () => void;
  ensemblGenes?: EnsemblGene[];
}> = props => {
  let pageLink = `${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}/${
    typeof props.alteration === 'string'
      ? props.alteration
      : props.alteration.name
  }`;
  if (props.cancerType) {
    pageLink = `${pageLink}/${encodeSlash(props.cancerType)}`;
  }
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
  const alterationName = getAlterationName(props.alteration);
  const altDescription = getCategoricalAlterationDescription(
    props.hugoSymbol,
    alterationName,
    props.ensemblGenes
  );
  return (
    <>
      <Link to={pageLink} onClick={props.onClick}>
        {props.children
          ? props.children
          : props.showGene
          ? `${props.hugoSymbol} ${alterationName}`
          : alterationName}
      </Link>
      {altDescription && (
        <span>
          {' '}
          <InfoIcon overlay={altDescription} />
        </span>
      )}
    </>
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
    <AlterationPageLink hugoSymbol={'Other Biomarkers'} alteration={'MSI-H'}>
      microsatellite instability high (MSI-H)
    </AlterationPageLink>
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

export const getActionableGenesPageLink = (
  levels?: string,
  sections?: string
) => {
  const hashes = [];
  if (levels) {
    hashes.push(`levels=${levels}`);
  }
  if (sections) {
    hashes.push(`sections=${sections}`);
  }
  return `${PAGE_ROUTE.ACTIONABLE_GENE}${
    hashes.length > 0 ? '#' : ''
  }${hashes.join('&')}`;
};

export const SopPageLink: React.FunctionComponent<{
  version?: number;
  content?: string;
}> = props => {
  let link = SOP_LINK;
  let defaultContent = 'OncoKB SOP';
  if (props.version) {
    link += `/?version=v${props.version}`;
    defaultContent += ` v${props.version}`;
  }
  return <Linkout link={link}>{props.content || defaultContent}</Linkout>;
};
