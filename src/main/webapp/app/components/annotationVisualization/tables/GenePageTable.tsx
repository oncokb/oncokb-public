import OncoKBTable, { SearchColumn } from './OncoKBTable';
import {
  AnnotationImplication,
  LG_TABLE_FIXED_HEIGHT,
  MUTATIONS_TABLE_COLUMN_KEY,
  THRESHOLD_TABLE_FIXED_HEIGHT,
  TreatmentImplication,
  TREATMENTS_TABLE_COLUMN_KEY,
} from '../config/constants';
import React from 'react';
import { SortingRule } from 'react-table';
import { ColumnOption } from '../config/constants';

export const GenePageTable = <
  T extends TreatmentImplication | AnnotationImplication
>({
  data,
  columns,
  isPending,
  defaultSorted,
  selectedAnnotationColumns,
  selectedColumns,
  name,
  handleColumnsChange,
}: {
  data: T[];
  columns: SearchColumn<T>[];
  isPending: boolean;
  defaultSorted?: SortingRule[];
  selectedAnnotationColumns: string[];
  selectedColumns: {
    key: MUTATIONS_TABLE_COLUMN_KEY | TREATMENTS_TABLE_COLUMN_KEY;
    label: string;
    prop: string;
  }[];
  name: string;
  handleColumnsChange: (selectedOptions: ColumnOption[]) => void;
}): JSX.Element => {
  return (
    <OncoKBTable
      tableName={name}
      data={data}
      columns={columns}
      loading={isPending}
      pageSize={data.length === 0 ? 1 : data.length}
      selectedColumnsState={selectedAnnotationColumns}
      selectedColumns={selectedColumns}
      handleColumnsChange={handleColumnsChange}
      style={
        data.length === 0 || selectedAnnotationColumns.length === 0
          ? { height: '10vh' }
          : data.length > THRESHOLD_TABLE_FIXED_HEIGHT
          ? { height: LG_TABLE_FIXED_HEIGHT }
          : {}
      }
      fixedHeight={
        data.length === 0 || selectedAnnotationColumns.length === 0
          ? true
          : data.length > THRESHOLD_TABLE_FIXED_HEIGHT
      }
      defaultSorted={
        defaultSorted || [
          {
            id: MUTATIONS_TABLE_COLUMN_KEY.ONCOGENICITY,
            desc: true,
          },
        ]
      }
      className={'no-scroll'}
    />
  );
};
