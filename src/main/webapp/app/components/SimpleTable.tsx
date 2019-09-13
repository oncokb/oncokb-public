import * as React from 'react';
import { Table } from 'react-bootstrap';

export type SimpleTableProps = {
  columns: string[];
  rows: (JSX.Element | string)[][];
};
export const SimpleTable = (props: SimpleTableProps) => {
  const getRow = (row: (JSX.Element | string)[]) => {
    return row.map(cell => {
      return <td key={cell.toString()}>{cell}</td>;
    });
  };
  return (
    <Table>
      <thead>
        <tr>
          {props.columns.map(column => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map(row => (
          <tr key={row.toString()}>{getRow(row)}</tr>
        ))}
      </tbody>
    </Table>
  );
};
