import { Link } from 'react-router-dom';
import React from 'react';
import {
  DEFAULT_REFERENCE_GENOME,
  ONCOKB_TM,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  REGEXP,
  REGEXP_LINK,
  SOP_LINK,
  YOUTUBE_VIDEO_IDS,
} from 'app/config/constants';
import _ from 'lodash';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import reactStringReplace from 'react-string-replace';
import { ReactNodeArray } from 'prop-types';
import {
  encodeSlash,
  getAlterationName,
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
import { YEAR_END_SUMMARY_RANGE } from 'app/pages/aboutGroup/AboutPageNavTab';

export const getGenePageLink = (props: {
  hugoSymbol: string;
  searchQueries?: GenePageSearchQueries;
  hashQueries?: GenePageHashQueries;
}): string => {
  let pageLink = `${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}`;
  if (props.searchQueries && Object.keys(props.searchQueries).length > 0) {
    pageLink = `${pageLink}?${QueryString.stringify(props.searchQueries)}`;
  }
  if (props.hashQueries) {
    pageLink = `${pageLink}#${QueryString.stringify(props.hashQueries)}`;
  }
  return pageLink;
};

export const GenePageLink: React.FunctionComponent<{
  hugoSymbol: string;
  highlightContent?: boolean;
  searchQueries?: GenePageSearchQueries;
  hashQueries?: GenePageHashQueries;
  onClick?: () => void;
}> = props => {
  const highlightContent =
    props.highlightContent === undefined ? true : props.highlightContent;
  const pageLink = getGenePageLink({
    hugoSymbol: props.hugoSymbol,
    searchQueries: props.searchQueries,
    hashQueries: props.hashQueries,
  });
  return (
    <Link
      style={{ color: highlightContent ? undefined : 'black' }}
      to={pageLink}
      onClick={props.onClick}
    >
      {props.children ? props.children : props.hugoSymbol}
    </Link>
  );
};

export const getAlterationPageLink = (props: {
  hugoSymbol: string;
  alteration: IAlteration | string;
  alterationRefGenomes?: REFERENCE_GENOME[];
  cancerType?: string;
  searchQueries?: AlterationPageSearchQueries;
  hashQueries?: AlterationPageHashQueries;
}): string => {
  let pageLink = `${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}/${
    typeof props.alteration === 'string'
      ? props.alteration
      : props.alteration.name
  }`;
  if (props.cancerType) {
    pageLink = `${pageLink}/${encodeSlash(props.cancerType)}`;
  }
  const sq = props.searchQueries || {};

  // Prop alterationRefGenomes is just a convinient way to process reference genomes when it's a list.
  if (!sq.refGenome && props.alterationRefGenomes) {
    if (!props.alterationRefGenomes.includes(DEFAULT_REFERENCE_GENOME)) {
      sq.refGenome = props.alterationRefGenomes[0];
    }
  }
  if (Object.keys(sq).length > 0) {
    pageLink = `${pageLink}?${QueryString.stringify(sq)}`;
  }
  if (props.hashQueries) {
    pageLink = `${pageLink}#${QueryString.stringify(props.hashQueries)}`;
  }
  return pageLink;
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
}> = props => {
  const alterationName = getAlterationName(props.alteration);
  const pageLink = getAlterationPageLink({
    hugoSymbol: props.hugoSymbol,
    alteration: props.alteration,
    alterationRefGenomes: props.alterationRefGenomes,
    cancerType: props.cancerType,
    searchQueries: props.searchQueries,
    hashQueries: props.hashQueries,
  });
  return (
    <>
      <Link to={pageLink} onClick={props.onClick}>
        {props.children
          ? props.children
          : props.showGene
          ? `${props.hugoSymbol} ${alterationName}`
          : alterationName}
      </Link>
    </>
  );
};

export const getGenomicPageLocation = (props: {
  rootRoute: PAGE_ROUTE.GENOMIC_CHANGE | PAGE_ROUTE.HGVSG;
  query: string;
  refGenome?: REFERENCE_GENOME;
  cancerType?: string;
}): any => {
  const location = {
    pathname: `${props.rootRoute}/${props.query}`,
    search: {} as any,
  };
  if (props.refGenome) {
    location.search.refGenome = props.refGenome;
  }
  if (props.cancerType) {
    location.search.tumorType = encodeSlash(props.cancerType);
  }
  return location;
};

export const getGenomicPageLink = (props: {
  rootRoute: PAGE_ROUTE.GENOMIC_CHANGE | PAGE_ROUTE.HGVSG;
  query: string;
  refGenome?: REFERENCE_GENOME;
  cancerType?: string;
}): string => {
  const location = getGenomicPageLocation(props);
  let pageLink = location.pathname;
  if (Object.keys(location.search).length > 0) {
    pageLink = `${pageLink}?${QueryString.stringify(location.search)}`;
  }
  return pageLink;
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
}> = props => {
  let link = SOP_LINK;
  let defaultContent = `${ONCOKB_TM} SOP`;
  if (props.version) {
    link += `/?version=v${props.version}`;
    defaultContent += ` v${props.version}`;
  }
  return <Linkout link={link}>{props.children || defaultContent}</Linkout>;
};

export const TrialActivationPageLink: React.FunctionComponent<{
  trialActivationKey: string;
  onRedirect?: () => void;
}> = props => {
  return (
    <Link
      to={`${PAGE_ROUTE.ACCOUNT_ACTIVE_TRIAL_FINISH}?key=${props.trialActivationKey}`}
      onClick={props.onRedirect}
    >
      Go to trial license agreement
    </Link>
  );
};

export const getAccountActivationLink = (
  activationKey: string,
  login: string
) => {
  return `${PAGE_ROUTE.ACCOUNT_VERIFY}?key=${activationKey}&login=${login}`;
};
export const getPasswordResetLink = (resetKey: string) => {
  return `${PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_FINISH}?key=${resetKey}`;
};

export const YearEndReviewPageLink: React.FunctionComponent<{
  year?: typeof YEAR_END_SUMMARY_RANGE[number];
}> = props => {
  const link = `${PAGE_ROUTE.YEAR_END_SUMMARY}${
    props.year ? '#' + props.year : ''
  }`;
  return <Link to={link}>{props.children}</Link>;
};
