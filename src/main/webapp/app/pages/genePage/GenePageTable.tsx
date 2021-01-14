import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import {
  LG_TABLE_FIXED_HEIGHT,
  TABLE_COLUMN_KEY,
  THRESHOLD_TABLE_FIXED_HEIGHT,
} from 'app/config/constants';
import React from 'react';

export const GenePageTable: React.FunctionComponent<{
  data: any[];
  columns: SearchColumn<any>[];
  isPending: boolean;
}> = props => {
  return (
    <OncoKBTable
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
      defaultSorted={[
        {
          id: TABLE_COLUMN_KEY.LEVEL,
          desc: false,
        },
        {
          id: TABLE_COLUMN_KEY.ALTERATION,
          desc: false,
        },
      ]}
    />
  );
};
