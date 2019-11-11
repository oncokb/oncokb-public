import { CHANGED_ANNOTATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import {
  ElementType,
  SimpleTable,
  SimpleTableRow
} from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';

export const ChangedAnnotationListItem = (props: {
  data: SimpleTableRow[];
}) => {
  return (
    <li>
      Changed Annotation:
      <Row>
        <SimpleTable columns={CHANGED_ANNOTATION_COLUMNS} rows={props.data} />
      </Row>
    </li>
  );
};
