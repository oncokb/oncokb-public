import { UPDATED_IMPLICATION_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { ElementType, SimpleTable } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';

export const UpdatedTxImplListItem = (props: { data: ElementType[][] }) => {
  return (
    <li>
      Updated therapeutic implications - {props.data.length} new {pluralize('association', props.data.length)}
      <Row>
        <SimpleTable columns={UPDATED_IMPLICATION_COLUMNS} rows={props.data} />
      </Row>
    </li>
  );
};
