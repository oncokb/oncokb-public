import * as React from 'react';
import { Table } from 'react-bootstrap';

export type ElementType = JSX.Element | string;
export type SimpleTableCell = { key: string, content: ElementType };
export type SimpleTableRow = { key: string, content: SimpleTableCell[] };
export type SimpleTableRows = SimpleTableRow[];
export type SimpleTableColumn = {
  size?: number;
  name: string;
};
export type SimpleTableProps = {
  columns: SimpleTableColumn[];
  rows: SimpleTableRows;
};

export const SimpleTable = (props: SimpleTableProps) => {
  const getRow = (row: SimpleTableRow) => {
    return row.content ? row.content.map(cell => {
      return <td key={cell.key}>{cell.content}</td>;
    }) : null;
  };
  return (
    <Table>
      <thead>
      <tr>
        {props.columns.map(column => (
          <th key={column.name}>{column.name}</th>
        ))}
      </tr>
      </thead>
      <tbody>
      {props.rows.map(row => (
        <tr key={row.key}>{getRow(row)}</tr>
      ))}
      </tbody>
    </Table>
  );
};
