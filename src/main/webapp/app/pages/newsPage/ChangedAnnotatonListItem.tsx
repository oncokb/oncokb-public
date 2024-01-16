import {
  CHANGED_ANNOTATION_LEVEL_COLUMNS,
  CHANGED_ANNOTATION_DRUG_COLUMNS,
  CHANGED_ANNOTATION_ADDITIONAL_DRUG_SAME_LEVEL_COLUMNS,
  CHANGED_ANNOTATION_ADDITIONAL_DRUG_DIFF_LEVEL_COLUMNS,
  GENE,
  MUTATION,
} from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import _ from 'lodash';

import mainStyle from './main.module.scss';
import {
  convertGeneInputToLinks,
  getColumnIndexByName,
  linkableMutationName,
} from './Util';
import { AlterationPageLink } from 'app/shared/utils/UrlUtils';

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
        'Updated therapeutic implications - Addition of therapies for variants with a level of evidence';
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

  const geneColumnIndex = getColumnIndexByName(annotationColumnHeader, GENE);
  const mutationColumnIndex = getColumnIndexByName(
    annotationColumnHeader,
    MUTATION
  );

  if (mutationColumnIndex > -1 && geneColumnIndex > -1) {
    // transform the gene and mutation input to a link, ignore the inputs with comma, pipe or slash
    props.data.forEach(row => {
      const geneInput = row.content[geneColumnIndex].content;
      const mutationInput = row.content[mutationColumnIndex].content;
      if (typeof geneInput === 'string' && typeof mutationInput === 'string') {
        if (linkableMutationName(geneInput, mutationInput)) {
          row.content[mutationColumnIndex].content = (
            <AlterationPageLink
              key={`${geneInput}-${mutationInput}`}
              hugoSymbol={geneInput}
              alteration={mutationInput}
            />
          );
        }
      }
    });
  }

  if (geneColumnIndex > -1) {
    // transform the gene input to link(s)
    props.data.forEach(row => {
      const geneInput = row.content[geneColumnIndex].content;
      if (typeof geneInput === 'string') {
        row.content[geneColumnIndex].content = convertGeneInputToLinks(
          geneInput
        );
      }
    });
  }

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
