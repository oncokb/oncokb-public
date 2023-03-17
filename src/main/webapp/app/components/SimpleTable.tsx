import * as React from 'react';
import { Table } from 'react-bootstrap';

export type ElementType = JSX.Element | string | JSX.Element[];
export type SimpleTableCell = { key: string; content: ElementType };
export type SimpleTableRow = { key: string; content: SimpleTableCell[] };
export type SimpleTableRows = SimpleTableRow[];
export type SimpleTableColumn = {
  size?: number;
  content?: ElementType;
  name: string;
};
export type SimpleTableProps = {
  columns: SimpleTableColumn[];
  rows: SimpleTableRows;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
};

export const SimpleTable = (props: SimpleTableProps) => {
  const getRow = (row: SimpleTableRow) => {
    return row.content
      ? row.content.map(cell => {
          return <td key={cell.key}>{cell.content}</td>;
        })
      : null;
  };
  return (
    <Table className={props.tableClassName}>
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
      <tbody className={props.tbodyClassName}>
        {props.rows.map(row => (
          <tr key={row.key}>{getRow(row)}</tr>
        ))}
      </tbody>
    </Table>
  );
};
