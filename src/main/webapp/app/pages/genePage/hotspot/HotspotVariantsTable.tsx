import React, { FunctionComponent } from 'react';
import { BiologicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import { GenePageTable } from 'app/pages/genePage/GenePageTable';
import { AlterationPageLink } from 'app/shared/utils/UrlUtils';
import {
  filterByKeyword,
  getDefaultColumnDefinition,
} from 'app/shared/utils/Utils';
import { REFERENCE_GENOME, TABLE_COLUMN_KEY } from 'app/config/constants';
import { LongText } from 'app/oncokb-frontend-commons/src/components/LongText';

const getColumns = (hugoSymbol: string): SearchColumn<BiologicalVariant>[] => [
  {
    ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
    accessor: 'variant',
    onFilter: (data: BiologicalVariant, keyword: string) =>
      filterByKeyword(data.variant.name, keyword),
    Cell(props: { original: BiologicalVariant }) {
      return (
        <AlterationPageLink
          hugoSymbol={hugoSymbol}
          alteration={{
            alteration: props.original.variant.alteration,
            name: props.original.variant.name,
          }}
          alterationRefGenomes={
            props.original.variant.referenceGenomes as REFERENCE_GENOME[]
          }
          germline={false}
        />
      );
    },
  },
  {
    ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ONCOGENICITY),
    Header: <span>Oncogenicity</span>,
    onFilter: (data: BiologicalVariant, keyword: string) =>
      filterByKeyword(data.oncogenic, keyword),
  },
  {
    Header: <span>Mutation Effect Description</span>,
    accessor: 'mutationEffectDescription',
    minWidth: 300,
    sortable: false,
    onFilter: (data: BiologicalVariant, keyword: string) =>
      filterByKeyword(data.mutationEffectDescription, keyword),
    Cell(props: { original: BiologicalVariant }) {
      return props.original.mutationEffectDescription ? (
        <LongText text={props.original.mutationEffectDescription} />
      ) : (
        <></>
      );
    },
  },
];

/**
 * The alterations {ONCOKB_TM} curates at a hotspot position, as listed on the
 * hotspot page mockup.
 */
const HotspotVariantsTable: FunctionComponent<{
  hugoSymbol: string;
  variants: BiologicalVariant[];
}> = props => (
  <GenePageTable
    data={props.variants}
    columns={getColumns(props.hugoSymbol)}
    isPending={false}
    defaultSorted={[
      {
        id: TABLE_COLUMN_KEY.ONCOGENICITY,
        desc: false,
      },
    ]}
  />
);

export default HotspotVariantsTable;
