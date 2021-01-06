import { UPDATED_IMPLICATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import {
  ElementType,
  SimpleTable,
  SimpleTableRow,
} from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';

export const UpdatedTxImplListItem = (props: {
  data: SimpleTableRow[];
  numOfAssociationsInUpdatedImplication?: number;
}) => {
  const numOFAssociations = props.numOfAssociationsInUpdatedImplication
    ? props.numOfAssociationsInUpdatedImplication
    : props.data.length;
  return (
    <li>
      Updated therapeutic implications - {numOFAssociations} new{' '}
      {pluralize('association', numOFAssociations)}
      <Row>
        <SimpleTable columns={UPDATED_IMPLICATION_COLUMNS} rows={props.data} />
      </Row>
    </li>
  );
};
