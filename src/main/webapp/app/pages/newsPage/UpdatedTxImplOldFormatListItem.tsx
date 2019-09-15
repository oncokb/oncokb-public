import { UPDATED_IMPLICATION_OLD_FORMAT_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, ElementType, SimpleTableRows } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';
import * as _ from 'lodash';

export const UpdatedTxImplOldFormatListItem = (props: { data: { [level: string]: ElementType[] } }) => {
  const rows = _.reduce(
    props.data,
    (acc, next, key) => {
      const level = ['2', '3'].includes(key) ? `${key}A` : key;
      acc.push([
        level,
        <ul key={level}>
          {next.map((cell: ElementType) => (
            <li key={cell.toString()}>{cell}</li>
          ))}
        </ul>
      ]);
      return acc;
    },
    [] as SimpleTableRows
  );
  return (
    <li>
      Updated therapeutic {pluralize('implication', rows.length)}
      <Row>
        <SimpleTable columns={UPDATED_IMPLICATION_OLD_FORMAT_COLUMNS} rows={rows} />
      </Row>
    </li>
  );
};
