import OncoKBTable, { SearchColumn } from './OncoKBTable';
import {
  LG_TABLE_FIXED_HEIGHT,
  MUTATIONS_TABLE_COLUMN_KEY,
  THRESHOLD_TABLE_FIXED_HEIGHT,
} from '../../config/constants';
import React from 'react';
import { SortingRule } from 'react-table';

export const GenePageTable: React.FunctionComponent<{
  data: any[];
  columns: SearchColumn<any>[];
  isPending: boolean;
  defaultSorted?: SortingRule[];
  name: string;
}> = props => {
  return (
    <OncoKBTable
      tableName={props.name}
      data={props.data}
      columns={props.columns}
      loading={props.isPending}
      pageSize={props.data.length === 0 ? 1 : props.data.length}
      style={
        props.data.length > THRESHOLD_TABLE_FIXED_HEIGHT
          ? {
              height: LG_TABLE_FIXED_HEIGHT,
            }
          : undefined
      }
      fixedHeight={props.data.length > THRESHOLD_TABLE_FIXED_HEIGHT}
      defaultSorted={
        props.defaultSorted || [
          {
            id: MUTATIONS_TABLE_COLUMN_KEY.LEVEL,
            desc: true,
          },
          {
            id: MUTATIONS_TABLE_COLUMN_KEY.ONCOGENICITY,
            desc: true,
          },
        ]
      }
    />
  );
};
