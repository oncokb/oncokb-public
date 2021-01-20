import { Link } from 'react-router-dom';
import React from 'react';
import {
  DEFAULT_REFERENCE_GENOME,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  REGEXP,
  REGEXP_LINK,
  SEARCH_QUERY_KEY,
} from 'app/config/constants';
import _ from 'lodash';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import reactStringReplace from 'react-string-replace';
import { ReactNodeArray } from 'prop-types';
import { encodeSlash } from 'app/shared/utils/Utils';
import { Linkout } from 'app/shared/links/Linkout';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';

export const GenePageLink: React.FunctionComponent<{
  hugoSymbol: string;
  content?: string;
  highlightContent?: boolean;
}> = props => {
  const highlightContent =
    props.highlightContent === undefined ? true : props.highlightContent;
  return (
    <Link
      style={{ color: highlightContent ? undefined : 'black' }}
      to={`${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}`}
    >
      {props.content ? props.content : props.hugoSymbol}
    </Link>
  );
};

export const AlterationPageLink: React.FunctionComponent<{
  hugoSymbol: string;
  alteration: string;
  alterationRefGenomes?: REFERENCE_GENOME[];
  showGene?: boolean;
  content?: string;
}> = props => {
  let pageLink = `${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}/${props.alteration}`;
  if (
    props.alterationRefGenomes &&
    props.alterationRefGenomes.length > 0 &&
    !props.alterationRefGenomes.includes(DEFAULT_REFERENCE_GENOME)
  ) {
    pageLink = `${pageLink}?${SEARCH_QUERY_KEY.REFERENCE_GENOME}=${props.alterationRefGenomes[0]}`;
  }
  return (
    <Link to={pageLink}>
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
