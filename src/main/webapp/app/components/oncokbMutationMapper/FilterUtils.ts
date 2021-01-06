import {
  CancerTypeFilter,
  DataFilter,
  DataFilterType,
} from 'react-mutation-mapper';
import { OncokbMutation } from 'app/components/oncokbMutationMapper/OncokbMutation';

export const CANCER_TYPE_FILTER_ID = '_oncoKbCancerTypeFilter_';
export const ONCOGENICITY_FILTER_ID = '_oncoKbOncogenicityFilter_';
export const ONCOGENICITY_FILTER_TYPE = 'oncoKbOncogenicityFilterType';

export function findPositionFilter(dataFilters: DataFilter[]) {
  return dataFilters.find(f => f.type === DataFilterType.POSITION);
}

export function findOncogenicityFilter(dataFilters: DataFilter[]) {
  return dataFilters.find(f => f.id === ONCOGENICITY_FILTER_ID);
}

export function applyOncogenicityFilter(
  filter: DataFilter<string>,
  mutation: OncokbMutation
) {
  return filter.values.includes(mutation.oncogenic);
}

export function findCancerTypeFilter(dataFilters: DataFilter[]) {
  return dataFilters.find(f => f.id === CANCER_TYPE_FILTER_ID);
}

export function applyCancerTypeFilter(
  filter: CancerTypeFilter,
  mutation: OncokbMutation
) {
  return (
    mutation.cancerType !== undefined &&
    filter.values.map(f => mutation.cancerType!.includes(f)).includes(true)
  );
}
