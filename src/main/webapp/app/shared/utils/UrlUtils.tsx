import { Link } from 'react-router-dom';
import React from 'react';
import { PAGE_ROUTE, REGEXP, REGEXP_LINK } from 'app/config/constants';
import _ from 'lodash';
import { PMIDLink } from 'app/shared/links/PMIDLink';
import reactStringReplace from 'react-string-replace';
import { ReactNodeArray } from 'prop-types';
import { encodeSlash } from 'app/shared/utils/Utils';

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
  showGene?: boolean;
  content?: string;
}> = props => {
  return (
    <Link
      to={`${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}/${props.alteration}`}
    >
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
