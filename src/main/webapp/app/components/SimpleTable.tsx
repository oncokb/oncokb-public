import * as React from 'react';
import { Table } from 'react-bootstrap';

export type ElementType = JSX.Element | string;
export type SimpleTableCell = {
  key: string;
  content: ElementType | ElementType[];
};
export type SimpleTableRow = { key: string; content: SimpleTableCell[] };
export type SimpleTableRows = SimpleTableRow[];
export type SimpleTableColumn = {
  size?: number;
  content?: ElementType;
  name: string;
};
export type SimpleTableProps = {
  columns?: SimpleTableColumn[];
  rows: SimpleTableRows;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
};

export const SimpleTable = (props: SimpleTableProps) => {
  const getRow = (row: SimpleTableRow) => {
    return row.content
      ? row.content.map(({ key, content }) => {
          return <td key={key}>{content}</td>;
        })
      : null;
  };
  return (
    <div className={'table-responsive'}>
      <Table className={props.tableClassName}>
        {props.columns && (
          <thead className={props.theadClassName}>
            <tr>
              {props.columns.map(column => (
                <th
                  key={column.name}
                  style={column.size ? { width: column.size } : undefined}
                >
                  {column.content ? column.content : column.name}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className={props.tbodyClassName}>
          {props.rows.flatMap(({ key, content }) => {
            let maxContentSize = 1;
            for (const cur of content) {
              maxContentSize = Array.isArray(cur.content)
                ? Math.max(cur.content.length, maxContentSize)
                : maxContentSize;
            }
            const elements: JSX.Element[] = [];
            for (let i = 0; i < maxContentSize; i++) {
              const element = (
                <tr key={`${key}_${i}`}>
                  {content.map(({ content: innerContent, key: innerKey }) => {
                    if (Array.isArray(innerContent)) {
                      return <td key={innerKey}>{innerContent[i]}</td>;
                    } else if (i === 0) {
                      return (
                        <td
                          key={innerKey}
                          rowSpan={
                            maxContentSize > 1 ? maxContentSize : undefined
                          }
                        >
                          {innerContent}
                        </td>
                      );
                    } else {
                      return <></>;
                    }
                  })}
                </tr>
              );
              elements.push(element);
            }
            return elements;
          })}
        </tbody>
      </Table>
    </div>
  );
};
