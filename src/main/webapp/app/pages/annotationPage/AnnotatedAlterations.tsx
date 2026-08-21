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
  getHotspotRangePageLink,
} from 'app/shared/utils/UrlUtils';
import { Citations } from 'app/shared/api/generated/OncoKbAPI';
import { DescriptionTooltip } from 'app/pages/annotationPage/DescriptionTooltip';
import SummaryWithRefs from 'app/oncokb-frontend-commons/src/components/SummaryWithRefs';
import React, { FunctionComponent } from 'react';
import { GenePageTable } from 'app/pages/genePage/GenePageTable';
import { getHotspotResidue } from 'app/pages/genePage/hotspot/HotspotUtils';
import { CancerHotspotLink } from 'app/components/cancerHotspot/CancerHotspot';
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
    // Wide enough for the header and its filter icon not to be truncated.
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
      // An alteration on a hotspot range has no range name to route with, so it
      // links to the range placeholder page instead of a position page.
      const residue = getHotspotResidue(props.original);
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <CancerHotspotLink
            link={
              residue
                ? getHotspotPageLink({ hugoSymbol, residue })
                : getHotspotRangePageLink({ hugoSymbol })
            }
            ariaLabel={`${hugoSymbol} ${residue ?? 'hotspot range'} hotspot`}
            size={HOTSPOT_ICON_SIZE}
          />
        </div>
      );
    },
  };
  const somaticColumns = [
    altColumn,
    hotspotColumn,
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
  const style = props.isLargeScreen
    ? {
        width: '80%',
        marginBottom: '-30px',
        zIndex: 1,
      }
    : undefined;

  const hasPathogenicity = props.germline
    ? props.alterations.some(alteration => !!alteration.pathogenic)
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
        data={props.alterations}
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
