import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import {
  LG_TABLE_FIXED_HEIGHT,
  THRESHOLD_TABLE_FIXED_HEIGHT,
} from 'app/config/constants';
import React from 'react';
import {
  getAlleleStatesFromEvidence,
  getAlterationName,
} from 'app/shared/utils/Utils';
import { LongText } from 'app/oncokb-frontend-commons/src/components/LongText';
import { Evidence } from 'app/shared/api/generated/OncoKbAPI';
import AlleleStateTag from 'app/components/tag/AlleleStateTag';
import { genomicIndicatorNameSortMethod } from 'app/shared/utils/ReactTableUtils';

export const GenomicIndicatorTable: React.FunctionComponent<{
  data: Evidence[];
  isPending: boolean;
}> = props => {
  const sortedData = [...props.data].sort((a, b) =>
    genomicIndicatorNameSortMethod(a.name, b.name)
  );

  const columns: SearchColumn<Evidence>[] = [
    {
      Header: <span>Genomic Indicator</span>,
      maxWidth: 200,
      accessor: 'name',
      Cell(row: { original: Evidence }) {
        const alleleState = getAlleleStatesFromEvidence(row.original);
        return (
          <>
            <div>{row.original.name}</div>
            {alleleState && <AlleleStateTag alleleState={alleleState} />}
          </>
        );
      },
    },
    {
      Header: <span>Inheritance</span>,
      maxWidth: 200,
      Cell(row: { original: Evidence }) {
        return <span>{row.original.knownEffect}</span>;
      },
    },
    {
      Header: <span>Associated Variants</span>,
      maxWidth: 200,
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
    {
      Header: <span>Description</span>,
      accessor: 'description',
    },
  ];
  return (
    <OncoKBTable
      data={sortedData}
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
