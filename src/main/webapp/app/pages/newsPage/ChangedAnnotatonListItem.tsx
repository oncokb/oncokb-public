import {
  CHANGED_ANNOTATION_LEVEL_COLUMNS,
  CHANGED_ANNOTATION_DRUG_COLUMNS,
} from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import _ from 'lodash';

import mainstyle from './main.module.scss';

export enum AnnotationColumnHeaderType {
  LEVEL,
  DRUG,
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
  switch (props.columnHeaderType) {
    case AnnotationColumnHeaderType.DRUG:
      annotationColumnHeader = CHANGED_ANNOTATION_DRUG_COLUMNS;
      break;
    case AnnotationColumnHeaderType.LEVEL:
    default:
      annotationColumnHeader = CHANGED_ANNOTATION_LEVEL_COLUMNS;
      break;
  }

  return (
    <li>
      {props.title ? props.title : 'Changed Annotation:'}
      <Row className={'overflow-auto'}>
        <SimpleTable
          columns={annotationColumnHeader.slice(0, longestRow)}
          rows={props.data}
          theadClassName={mainstyle.changedAnnotationTableHead}
        />
      </Row>
    </li>
  );
};
