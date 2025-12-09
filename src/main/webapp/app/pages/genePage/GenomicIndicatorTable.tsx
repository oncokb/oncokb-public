import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import {
  ALLELE_STATE_BIALLELEIC,
  ALLELE_STATE_CARRIER,
  ALLELE_STATE_MONOALLELIC,
  AlleleState,
  LG_TABLE_FIXED_HEIGHT,
  THRESHOLD_TABLE_FIXED_HEIGHT,
} from 'app/config/constants';
import React from 'react';
import { getAlterationName } from 'app/shared/utils/Utils';
import { LongText } from 'app/oncokb-frontend-commons/src/components/LongText';
import { Evidence } from 'app/shared/api/generated/OncoKbAPI';
import AlleleStateTag from 'app/components/tag/AlleleStateTag';
import { genomicIndicatorNameSortMethod } from 'app/shared/utils/ReactTableUtils';

const parseAlleleStateFromIndicatorName = (
  name: string
): { displayName: string; alleleState?: AlleleState } => {
  const alleleStateMap: { [key: string]: AlleleState } = {
    carrier: ALLELE_STATE_CARRIER,
    monoallelic: ALLELE_STATE_MONOALLELIC,
    biallelic: ALLELE_STATE_BIALLELEIC,
  };

  const match = (name ?? '').match(
    /\s*\((carrier|monoallelic|biallelic)\)\s*$/i
  );
  if (match) {
    const alleleState = alleleStateMap[match[1].toLowerCase()];
    const displayName = name.replace(match[0], '').trim();
    return { displayName, alleleState };
  }

  return { displayName: name };
};

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
      id: 'name',
      Cell(row: { original: Evidence }) {
        const { displayName, alleleState } = parseAlleleStateFromIndicatorName(
          row.original.name
        );
        return (
          <>
            <div>{displayName}</div>
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
