import { BiologicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  filterByKeyword,
  getDefaultColumnDefinition,
} from 'app/shared/utils/Utils';
import {
  ONCOKB_TM,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
} from 'app/config/constants';
import {
  AlterationPageLink,
  getHotspotPageLink,
} from 'app/shared/utils/UrlUtils';
import { Citations } from 'app/shared/api/generated/OncoKbAPI';
import { DescriptionTooltip } from 'app/pages/annotationPage/DescriptionTooltip';
import SummaryWithRefs from 'app/oncokb-frontend-commons/src/components/SummaryWithRefs';
import React, { FunctionComponent } from 'react';
import { GenePageTable } from 'app/pages/genePage/GenePageTable';
import { getHotspotResidue } from 'app/pages/genePage/hotspot/HotspotUtils';
import {
  CancerHotspotIcon,
  CancerHotspotLink,
} from 'app/components/cancerHotspot/CancerHotspot';
import { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import { FilterTypes } from 'app/components/oncokbTable/filters/types';

const HOTSPOT_ICON_SIZE = 18;

const getColumns = (
  germline: boolean,
  hugoSymbol: string,
  useMutationEffectForGermline: boolean
): SearchColumn<BiologicalVariant>[] => {
  const altColumn = {
    ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
    accessor: 'variant',
    onFilter: (data: BiologicalVariant, keyword: string) =>
      filterByKeyword(data.variant.name, keyword),
    filterType: FilterTypes.STRING as const,
    getColumnFilterValue: (data: BiologicalVariant) => data.variant.name,
    Cell(props: { original: BiologicalVariant }) {
      return (
        <>
          <AlterationPageLink
            hugoSymbol={hugoSymbol}
            alteration={{
              alteration: props.original.variant.alteration,
              name: props.original.variant.name,
            }}
            alterationRefGenomes={
              props.original.variant.referenceGenomes as REFERENCE_GENOME[]
            }
            germline={germline}
          />
        </>
      );
    },
  };
  const descriptionColumn = {
    ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DESCRIPTION),
    accessor(d: BiologicalVariant) {
      return useMutationEffectForGermline
        ? {
            abstracts: d.mutationEffectAbstracts,
            pmids: d.mutationEffectPmids,
          }
        : {
            abstracts: d.pathogenicAbstracts,
            pmids: d.pathogenicPmids,
          };
    },
    Cell(props: { original: BiologicalVariant }) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {props.original.mutationEffectDescription ? (
            <DescriptionTooltip
              description={
                <SummaryWithRefs
                  content={props.original.mutationEffectDescription}
                  type="tooltip"
                />
              }
            />
          ) : undefined}
        </div>
      );
    },
  };
  const hotspotColumn = {
    Header: <span>Hotspot</span>,
    accessor: 'variant',
    id: 'hotspot',
    minWidth: 120,
    width: 120,
    sortable: false,
    filterType: FilterTypes.STRING as const,
    getColumnFilterValue: (data: BiologicalVariant) =>
      data.hotspot?.isHotspot ? 'Yes' : 'No',
    Cell(props: { original: BiologicalVariant }) {
      if (!props.original.hotspot?.isHotspot) {
        return <></>;
      }
      const residue = getHotspotResidue(hugoSymbol, props.original);
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          {residue ? (
            <CancerHotspotLink
              link={getHotspotPageLink({ hugoSymbol, residue })}
              ariaLabel={`${hugoSymbol} ${residue} hotspot`}
              size={HOTSPOT_ICON_SIZE}
            />
          ) : (
            <CancerHotspotIcon size={HOTSPOT_ICON_SIZE} />
          )}
        </div>
      );
    },
  };
  const somaticColumns = [
    altColumn,
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ONCOGENICITY),
      onFilter: (data: BiologicalVariant, keyword: string) =>
        filterByKeyword(data.oncogenic, keyword),
      filterType: FilterTypes.STRING as const,
      getColumnFilterValue: (data: BiologicalVariant) => data.oncogenic,
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.MUTATION_EFFECT),
      onFilter: (data: BiologicalVariant, keyword: string) =>
        filterByKeyword(data.mutationEffect, keyword),
      filterType: FilterTypes.STRING as const,
      getColumnFilterValue: (data: BiologicalVariant) => data.mutationEffect,
    },
    hotspotColumn,
    descriptionColumn,
  ];
  const germlineColumns = [
    altColumn,
    {
      Header: <span>Protein Change</span>,
      accessor: 'variant.proteinChange',
      onFilter: (data: BiologicalVariant, keyword: string) =>
        filterByKeyword(data.variant.proteinChange, keyword),
    },
    useMutationEffectForGermline
      ? {
          ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.MUTATION_EFFECT),
          onFilter: (data: BiologicalVariant, keyword: string) =>
            filterByKeyword(data.mutationEffect, keyword),
          filterType: FilterTypes.STRING as const,
          getColumnFilterValue: (data: BiologicalVariant) =>
            data.mutationEffect,
        }
      : {
          Header: <span>Pathogenicity</span>,
          accessor: 'pathogenic',
          onFilter: (data: BiologicalVariant, keyword: string) =>
            filterByKeyword(data.pathogenic, keyword),
          filterType: FilterTypes.STRING as const,
          getColumnFilterValue: (data: BiologicalVariant) => data.pathogenic,
        },
    {
      Header: <span>Penetrance</span>,
      accessor: 'penetrance',
      onFilter: (data: BiologicalVariant, keyword: string) =>
        filterByKeyword(data.penetrance, keyword),
      filterType: FilterTypes.STRING as const,
      getColumnFilterValue: (data: BiologicalVariant) => data.penetrance,
    },
    // Hiding because not in use now, but will be in the future
    // {
    //   Header: <span>Cancer Risk</span>,
    //   accessor: 'cancerRisk',
    //   onFilter: (data: BiologicalVariant, keyword: string) =>
    //     filterByKeyword(data.cancerRisk, keyword),
    // },
    descriptionColumn,
  ];
  return germline ? germlineColumns : somaticColumns;
};

const AnnotatedAlterations: FunctionComponent<{
  germline: boolean;
  hugoSymbol: string;
  alterations: BiologicalVariant[];
  isLargeScreen?: boolean;
}> = props => {
  const isMyd88 = props.hugoSymbol.toUpperCase() === 'MYD88';
  const filteredAlterations = isMyd88
    ? props.alterations.filter(alteration =>
        alteration.variant.referenceGenomes?.includes(REFERENCE_GENOME.GRCh37)
      )
    : props.alterations;

  const style = props.isLargeScreen
    ? {
        width: '80%',
        marginBottom: '-30px',
        zIndex: 1,
      }
    : undefined;

  const hasPathogenicity = props.germline
    ? filteredAlterations.some(alteration => !!alteration.pathogenic)
    : false;

  const useMutationEffectForGermline = props.germline && !hasPathogenicity; // Pharmocogenic gene like DPYD don't have pathogenicity

  return (
    <>
      <div style={style}>
        <span>
          {props.germline ? (
            <>
              <b>All {ONCOKB_TM} curated</b> {props.hugoSymbol} alterations.
            </>
          ) : (
            <>
              Oncogenic and mutation effects of <b>all {ONCOKB_TM} curated</b>{' '}
              {props.hugoSymbol} alterations.
            </>
          )}
        </span>
      </div>
      <GenePageTable
        data={filteredAlterations}
        columns={getColumns(
          props.germline,
          props.hugoSymbol,
          useMutationEffectForGermline
        )}
        isPending={false}
      />
    </>
  );
};

export default AnnotatedAlterations;
