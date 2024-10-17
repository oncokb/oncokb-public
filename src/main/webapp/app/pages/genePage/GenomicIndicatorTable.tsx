import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import {
  LG_TABLE_FIXED_HEIGHT,
  THRESHOLD_TABLE_FIXED_HEIGHT,
} from 'app/config/constants';
import React from 'react';
import { Evidence } from 'app/shared/api/generated/OncoKbAPI';
import { getAlterationName } from 'app/shared/utils/Utils';

export const GenomicIndicatorTable: React.FunctionComponent<{
  data: Evidence[];
  isPending: boolean;
}> = props => {
  const columns: SearchColumn<Evidence>[] = [
    {
      Header: <span>Name</span>,
      accessor: 'knownEffect',
    },
    {
      Header: <span>Description</span>,
      accessor: 'description',
    },
    {
      Header: <span>Associated Variants</span>,
      Cell(row: { original: Evidence }) {
        return (
          <span>
            {row.original.alterations
              .map(alt => getAlterationName(alt))
              .join(', ')}
          </span>
        );
      },
    },
  ];
  return (
    <OncoKBTable
      data={props.data}
      columns={columns}
      loading={props.isPending}
      showPagination={false}
      pageSize={props.data.length === 0 ? 1 : props.data.length}
      disableSearch
      style={
        props.data.length > THRESHOLD_TABLE_FIXED_HEIGHT
          ? {
              height: LG_TABLE_FIXED_HEIGHT,
            }
          : undefined
      }
    />
  );
};
