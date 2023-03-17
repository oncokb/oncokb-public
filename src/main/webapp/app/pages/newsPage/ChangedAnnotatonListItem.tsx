import {
  CHANGED_ANNOTATION_LEVEL_COLUMNS,
  CHANGED_ANNOTATION_DRUG_COLUMNS,
  CHANGED_ANNOTATION_ADDITIONAL_DRUG_SAME_LEVEL_COLUMNS,
  CHANGED_ANNOTATION_ADDITIONAL_DRUG_DIFF_LEVEL_COLUMNS,
} from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import _ from 'lodash';

import mainStyle from './main.module.scss';
import { GenePageLink } from 'app/shared/utils/UrlUtils';

export enum AnnotationColumnHeaderType {
  LEVEL,
  DRUG,
  ADDITIONAL_SAME_LEVEL_DRUG,
  ADDITIONAL_DIFF_LEVEL_DRUG,
}

export const ChangedAnnotationListItem = (props: {
  title?: string;
  data: SimpleTableRow[];
  columnHeaderType?: AnnotationColumnHeaderType;
}) => {
  let longestRow = 0;
  if (props.data.length > 0) {
    longestRow = _.sortBy(props.data, row => -row.content.length)[0].content
      .length;
  }

  let annotationColumnHeader = undefined;
  let useOneLineRowClass = true;
  let defaultTitle = '';
  switch (props.columnHeaderType) {
    case AnnotationColumnHeaderType.DRUG:
      annotationColumnHeader = CHANGED_ANNOTATION_DRUG_COLUMNS;
      break;
    case AnnotationColumnHeaderType.ADDITIONAL_SAME_LEVEL_DRUG:
      annotationColumnHeader = CHANGED_ANNOTATION_ADDITIONAL_DRUG_SAME_LEVEL_COLUMNS;
      useOneLineRowClass = false;
      defaultTitle =
        'Updated therapeutic implications - addition of therapies for variants with a level of evidence';
      break;
    case AnnotationColumnHeaderType.ADDITIONAL_DIFF_LEVEL_DRUG:
      annotationColumnHeader = CHANGED_ANNOTATION_ADDITIONAL_DRUG_DIFF_LEVEL_COLUMNS;
      useOneLineRowClass = false;
      defaultTitle = 'Changed Annotation';
      break;
    case AnnotationColumnHeaderType.LEVEL:
    default:
      annotationColumnHeader = CHANGED_ANNOTATION_LEVEL_COLUMNS;
      useOneLineRowClass = true;
      defaultTitle = 'Changed Annotation';
      break;
  }

  // find the index of the gene column
  const geneColumnIndex = annotationColumnHeader.findIndex(
    column => column.name === 'Gene'
  );
  // transform the gene input to a link
  props.data.forEach(row => {
    const geneInput = row.content[geneColumnIndex].content;
    console.log('geneInput', geneInput);
    if (typeof geneInput === 'string') {
      const tokens = geneInput.split(',');
      if (tokens.length > 1) {
        const itemLinks = tokens.map((token, i) => {
          token = token.trim();
          if (i === tokens.length - 1) {
            return <GenePageLink hugoSymbol={token} />;
          }
          return (
            <>
              <GenePageLink hugoSymbol={token} />
              {', '}
            </>
          );
        });
        row.content[geneColumnIndex].content = itemLinks;
      } else {
        row.content[geneColumnIndex].content = (
          <GenePageLink hugoSymbol={geneInput} />
        );
      }
    }
  });

  return (
    <li>
      {props.title ? props.title : defaultTitle}
      <Row className={'overflow-auto'}>
        <SimpleTable
          columns={annotationColumnHeader.slice(0, longestRow)}
          rows={props.data}
          theadClassName={useOneLineRowClass ? mainStyle.oneRowHeader : ''}
        />
      </Row>
    </li>
  );
};
