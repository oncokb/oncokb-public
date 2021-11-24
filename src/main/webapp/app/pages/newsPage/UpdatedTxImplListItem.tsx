import { UPDATED_IMPLICATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';

export const UpdatedTxImplListItem = (props: {
  title?: string;
  data: SimpleTableRow[];
  numOfAssociationsInUpdatedImplication?: number;
}) => {
  const numOFAssociations = props.numOfAssociationsInUpdatedImplication
    ? props.numOfAssociationsInUpdatedImplication
    : props.data.length;
  const defaultTitle = `Updated therapeutic implications - ${numOFAssociations} new ${pluralize(
    'association',
    numOFAssociations
  )}`;
  return (
    <li>
      {props.title ? props.title : defaultTitle}
      <Row className={'overflow-auto'}>
        <SimpleTable columns={UPDATED_IMPLICATION_COLUMNS} rows={props.data} />
      </Row>
    </li>
  );
};
