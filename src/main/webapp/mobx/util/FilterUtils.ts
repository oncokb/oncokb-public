import { CancerTypeFilter, DataFilter, DataStore } from 'react-mutation-mapper';

import { IExtendedMutation, IMutation, ITumorTypeDecomposition } from '../../../server/src/model/Mutation';

export const CANCER_TYPE_FILTER_ID = '_insightCancerTypeFilter_';
export const MUTATION_STATUS_FILTER_ID = '_insightMutationStatusFilter_';
export const PROTEIN_IMPACT_TYPE_FILTER_ID = '_insightProteinImpactTypeFilter_';
export const MUTATION_STATUS_FILTER_TYPE = 'insightMutationStatus';
export const MUTATION_COUNT_FILTER_TYPE = 'insightMutationCount';

export enum MutationStatusFilterValue {
  SOMATIC = 'Somatic',
  GERMLINE = 'Germline',
  BENIGN_GERMLINE = 'Benign Germline',
  PATHOGENIC_GERMLINE = 'Pathogenic Germline',
  BIALLELIC_PATHOGENIC_GERMLINE = 'Biallelic Pathogenic Germline'
}

export type MutationStatusFilter = DataFilter<MutationStatusFilterValue>;
export type MutationCountFilter = DataFilter<number>; // TODO this should be an interval not a single number

export function applyCancerTypeFilter(filter: CancerTypeFilter, mutation: IMutation) {
  return (
    mutation.countsByTumorType.find(
      c => filter.values.find(v => v.length > 0 && c.variantCount > 0 && c.tumorType.toLowerCase().includes(v.toLowerCase())) !== undefined
    ) !== undefined
  );
}

export function applyMutationStatusFilter(
  filter: MutationStatusFilter,
  mutation: IExtendedMutation,
  biallelicFrequency: number = mutation.biallelicPathogenicGermlineFrequency
) {
  return filter.values
    .map(v => {
      let match = false;

      const isGermline = mutation.mutationStatus.toLowerCase().includes(MutationStatusFilterValue.GERMLINE.toLowerCase());
      const isPathogenicGermline = isGermline && mutation.pathogenic === '1';
      const isBenignGermline = isGermline && !isPathogenicGermline;
      const isSomatic = mutation.mutationStatus.toLowerCase().includes(MutationStatusFilterValue.SOMATIC.toLowerCase());

      if (v.length > 0) {
        if (v === MutationStatusFilterValue.SOMATIC) {
          match = isSomatic;
        } else if (v === MutationStatusFilterValue.GERMLINE) {
          match = isGermline;
        } else if (v === MutationStatusFilterValue.BENIGN_GERMLINE) {
          match = isBenignGermline;
        } else if (v === MutationStatusFilterValue.PATHOGENIC_GERMLINE) {
          match = isPathogenicGermline;
        } else if (v === MutationStatusFilterValue.BIALLELIC_PATHOGENIC_GERMLINE) {
          match = isPathogenicGermline && biallelicFrequency > 0;
        }
      }

      return match;
    })
    .includes(true);
}

export function containsCancerType(filter: CancerTypeFilter | undefined, cancerType: string) {
  return !filter || filter.values.find(v => cancerType.toLowerCase().includes(v.toLowerCase())) !== undefined;
}

export function matchesMutationStatus(
  filter: MutationStatusFilter | undefined,
  mutation: IExtendedMutation,
  tumorTypeDecomposition: ITumorTypeDecomposition
) {
  return !filter || applyMutationStatusFilter(filter, mutation, tumorTypeDecomposition.biallelicRatio);
}

export function findCancerTypeFilter(dataFilters: DataFilter[]) {
  return dataFilters.find(f => f.id === CANCER_TYPE_FILTER_ID);
}

export function findMutationStatusFilter(dataFilters: DataFilter[]) {
  return dataFilters.find(f => f.id === MUTATION_STATUS_FILTER_ID);
}

export function findMutationTypeFilter(dataFilters: DataFilter[]) {
  return dataFilters.find(f => f.id === PROTEIN_IMPACT_TYPE_FILTER_ID);
}

export function getMutationStatusFilterOptions() {
  return [
    { value: MutationStatusFilterValue.SOMATIC },
    { value: MutationStatusFilterValue.BENIGN_GERMLINE },
    { value: MutationStatusFilterValue.PATHOGENIC_GERMLINE },
    { value: MutationStatusFilterValue.BIALLELIC_PATHOGENIC_GERMLINE }
  ];
}

export function onDropdownOptionSelect(
  selectedValues: string[],
  allValuesSelected: boolean,
  dataStore: DataStore,
  dataFilterType: string,
  dataFilterId: string
) {
  // all other filters except the current filter with the given data filter id
  const otherFilters = dataStore.dataFilters.filter((f: DataFilter) => f.id !== dataFilterId);

  if (allValuesSelected) {
    // if all values are selected just remove the existing filter with the given data filter id
    // (assuming that no filtering required if everything is selected)
    dataStore.setDataFilters(otherFilters);
  } else {
    const dataFilter = {
      id: dataFilterId,
      type: dataFilterType,
      values: selectedValues
    };

    // replace the existing data filter wrt the current selection (other filters + new data filter)
    dataStore.setDataFilters([...otherFilters, dataFilter]);
  }
}
