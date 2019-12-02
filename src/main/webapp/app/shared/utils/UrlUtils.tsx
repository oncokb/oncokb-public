import { Link } from 'react-router-dom';
import React from 'react';
import { PAGE_ROUTE, REGEXP, REGEXP_LINK } from 'app/config/constants';
import _ from 'lodash';
import ReactHtmlParser from 'react-html-parser';

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
      to={`${PAGE_ROUTE.GENE_HEADER}/${props.hugoSymbol}/${props.alteration}/${props.tumorType}`}
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
    let contentWithLink = props.content;
    _.forEach(regexps, (regexp) => {
      const results = _.uniq(props.content.match(new RegExp(regexp, 'ig')));
      if (results) {
        _.forEach(results, (matchedItem) => {
          const datum = matchedItem;
          switch ( regexp ) {
            case REGEXP.PMID:
              contentWithLink = contentWithLink.replace( new RegExp( `${datum}(?!s*,)`, 'g' ),
                `<a href="${REGEXP_LINK[regexp]}${datum.split( ':' )[ 1 ].trim()}" target="_blank">${datum}</a>` );
              break;
            case REGEXP.NCTID:
              contentWithLink = contentWithLink.replace( datum,
                `<a href="${REGEXP_LINK[regexp]}${datum}" target="_blank">${datum}</a>` );
              break;
            default:
              break;
          }
        });
      }
    });
  return (
    <div>
      {ReactHtmlParser(contentWithLink)}
    </div>
  );
};
