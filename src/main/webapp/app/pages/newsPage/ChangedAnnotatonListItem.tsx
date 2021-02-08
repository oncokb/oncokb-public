import { CHANGED_ANNOTATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';

import mainstyle from './main.module.scss';

export const ChangedAnnotationListItem = (props: {
  title?: string;
  data: SimpleTableRow[];
}) => {
  return (
    <li>
      {props.title ? props.title : 'Changed Annotation'}:
      <Row>
        <SimpleTable
          columns={CHANGED_ANNOTATION_COLUMNS}
          rows={props.data}
          theadClassName={mainstyle.changedAnnotationTableHead}
        />
      </Row>
    </li>
  );
};
