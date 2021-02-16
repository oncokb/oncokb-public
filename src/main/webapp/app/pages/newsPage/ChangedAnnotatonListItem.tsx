import { CHANGED_ANNOTATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import _ from 'lodash';

import mainstyle from './main.module.scss';

export const ChangedAnnotationListItem = (props: {
  title?: string;
  data: SimpleTableRow[];
}) => {
  let longestRow = 0;
  if (props.data.length > 0) {
    longestRow = _.sortBy(props.data, row => -row.content.length)[0].content
      .length;
  }
  return (
    <li>
      {props.title ? props.title : 'Changed Annotation'}:
      <Row className={'overflow-auto'}>
        <SimpleTable
          columns={CHANGED_ANNOTATION_COLUMNS.slice(0, longestRow)}
          rows={props.data}
          theadClassName={mainstyle.changedAnnotationTableHead}
        />
      </Row>
    </li>
  );
};
