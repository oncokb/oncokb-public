import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import {
  AlleleState,
  LG_TABLE_FIXED_HEIGHT,
  THRESHOLD_TABLE_FIXED_HEIGHT,
} from 'app/config/constants';
import React from 'react';
import {
  getAlleleStatesFromEvidence,
  getAlterationName,
  getMechanismOfInheritanceFromAlleleStates,
} from 'app/shared/utils/Utils';
import { LongText } from 'app/oncokb-frontend-commons/src/components/LongText';
import { Evidence } from 'app/shared/api/generated/OncoKbAPI';
import AlleleStateTag from 'app/components/tag/alleleStateTag';

export const GenomicIndicatorTable: React.FunctionComponent<{
  data: Evidence[];
  isPending: boolean;
}> = props => {
  const columns: SearchColumn<Evidence>[] = [
    {
      Header: <span>Genomic Indicator</span>,
      maxWidth: 200,
      Cell(row: { original: Evidence }) {
        const alleleStates = getAlleleStatesFromEvidence(row.original);
        const alleleState: AlleleState | undefined = alleleStates.includes(
          'carrier'
        )
          ? 'carrier'
          : alleleStates[0];
        return (
          <>
            <div>{row.original.name}</div>
            <AlleleStateTag alleleState={alleleState} />
          </>
        );
      },
    },
    {
      Header: <span>Inheritance</span>,
      maxWidth: 200,
      Cell(row: { original: Evidence }) {
        return (
          <span>
            {getMechanismOfInheritanceFromAlleleStates(
              getAlleleStatesFromEvidence(row.original)
            )}
          </span>
        );
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
      Cell(row: { original: Evidence }) {
        return <LongText text={row.original.description} cutoff={180} />;
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
