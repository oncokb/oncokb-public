import { UPDATED_IMPLICATION_OLD_FORMAT_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import { SimpleTable, ElementType, SimpleTableRows, SimpleTableCell, SimpleTableRow } from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';
import * as _ from 'lodash';

export const UpdatedTxImplOldFormatListItem = (props: { data: { [level: string]: ElementType[] }, key: string }) => {
  const rows = _.reduce(
    props.data,
    (acc, next, key) => {
      const level = ['2', '3'].includes(key) ? `${key}A` : key;
      acc.push({
        key: `${key}-${level}-row`,
        content: [
          {
            key: `${key}-level-${level}`,
            content: level
          },
          {
            key: `${key}-level-${level}-list`,
            content: <ul key={level}>
              {next.map((cell: ElementType, index) => (
                <li key={`${key}-${level}-list-${index}`}>{cell}</li>
              ))}
            </ul>
          }
        ]
      });
      return acc;
    },
    [] as SimpleTableRows
  );
  return (
    <li>
      Updated therapeutic {pluralize('implication', rows.length)}
      <Row>
        <SimpleTable columns={UPDATED_IMPLICATION_OLD_FORMAT_COLUMNS} rows={rows}/>
      </Row>
    </li>
  );
};
