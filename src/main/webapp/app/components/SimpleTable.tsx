import * as React from 'react';
import { Table } from 'react-bootstrap';

export type ElementType = JSX.Element | string;
export type SimpleTableRows = ElementType[][];
export type SimpleTableColumn = {
  size?: number;
  name: string;
};
export type SimpleTableProps = {
  columns: SimpleTableColumn[];
  rows: SimpleTableRows;
};
export const SimpleTable = (props: SimpleTableProps) => {
  const getRow = (row: ElementType[]) => {
    return row.map(cell => {
      return <td key={cell.toString()}>{cell}</td>;
    });
  };
  return (
    <Table>
      <thead>
        <tr className="row">
          {props.columns.map(column => (
            <th key={column.name}>{column.name}</th>
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
