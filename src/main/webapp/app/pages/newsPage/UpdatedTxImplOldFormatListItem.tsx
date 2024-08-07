import { UPDATED_IMPLICATION_OLD_FORMAT_COLUMNS } from 'app/pages/newsPage/NewsPageContent';
import {
  SimpleTable,
  ElementType,
  SimpleTableRows,
} from 'app/components/SimpleTable';
import { Row } from 'react-bootstrap';
import React from 'react';
import pluralize from 'pluralize';

export const UpdatedTxImplOldFormatListItem = (props: {
  data: { [level: string]: ElementType[] };
  key: string;
}) => {
  const rows = Object.keys(props.data).reduce((acc, key) => {
    const level = ['2', '3'].includes(key) ? `${key}A` : key;
    acc.push({
      key: `${key}-${level}-row`,
      content: [
        {
          key: `${key}-level-${level}`,
          content: level,
        },
        {
          key: `${key}-level-${level}-list`,
          content: (
            <ul key={level}>
              {props.data[key].map((cell: ElementType, index) => (
                <li key={`${key}-${level}-list-${index}`}>{cell}</li>
              ))}
            </ul>
          ),
        },
      ],
    });
    return acc;
  }, [] as SimpleTableRows);
  return (
    <li>
      Updated therapeutic {pluralize('implication', rows.length)}
      <Row className={'overflow-auto'}>
        <SimpleTable
          columns={UPDATED_IMPLICATION_OLD_FORMAT_COLUMNS}
          rows={rows}
        />
      </Row>
    </li>
  );
};
