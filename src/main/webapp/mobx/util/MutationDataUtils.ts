import _ from 'lodash';
import { CancerTypeFilter } from 'react-mutation-mapper';

import { ICountByTumorType, IExtendedMutation, IMutation, ITumorTypeDecomposition } from '../../../server/src/model/Mutation';
import { applyMutationStatusFilter, containsCancerType, MutationStatusFilter } from './FilterUtils';

export function findAllUniqueCancerTypes(mutations: Array<Partial<IMutation>>) {
  return _.uniq(_.flatten(mutations.map(m => (m.countsByTumorType || []).map(c => c.tumorType))));
}

export function fetchMutationsByGene(hugoSymbol: string): Promise<IMutation[]> {
  return new Promise<IMutation[]>((resolve, reject) => {
    fetch(`/api/mutation?hugoSymbol=${hugoSymbol}`)
      .then(response => resolve(response.json()))
      .catch(err => reject(err));
  });
}

export function fetchExtendedMutationsByGene(hugoSymbol: string): Promise<IExtendedMutation[]> {
  return new Promise<IExtendedMutation[]>((resolve, reject) => {
    fetchMutationsByGene(hugoSymbol)
      .then(mutations => resolve(extendMutations(mutations)))
      .catch(err => reject(err));
  });
}

/**
 * Extends given mutations with frequency and biallelic count information.
 */
export function extendMutations(mutations: IMutation[]): IExtendedMutation[] {
  // filter out biallelic mutations, since their count is already included in germline mutations
  // we only use biallelic mutations to add frequency values and additional count fields
  return mutations.map(mutation => {
    const isSomatic = mutation.mutationStatus.toLowerCase() === 'somatic';
    const isGermline = mutation.mutationStatus.toLowerCase() === 'germline';
    const isPathogenic = mutation.pathogenic === '1';

    const pathogenicGermlineFrequency = isGermline && isPathogenic ? calculateOverallFrequency(mutation.countsByTumorType) : 0;
    const biallelicGermlineFrequency =
      isGermline && mutation.biallelicCountsByTumorType ? calculateOverallFrequency(mutation.biallelicCountsByTumorType) : 0;

    const tumorTypeDecomposition: ITumorTypeDecomposition[] = generateTumorTypeDecomposition(
      mutation.countsByTumorType,
      mutation.biallelicCountsByTumorType,
      mutation.qcPassCountsByTumorType
    );

    return {
      ...mutation,
      tumorTypeDecomposition,
      somaticFrequency: isSomatic ? calculateOverallFrequency(mutation.countsByTumorType) : 0,
      germlineFrequency: isGermline ? calculateOverallFrequency(mutation.countsByTumorType) : 0,
      pathogenicGermlineFrequency,
      biallelicGermlineFrequency,
      biallelicPathogenicGermlineFrequency: isPathogenic ? biallelicGermlineFrequency : 0,
      ratioBiallelicPathogenic:
        isPathogenic && mutation.biallelicCountsByTumorType && mutation.qcPassCountsByTumorType
          ? calculateTotalVariantRatio(mutation.biallelicCountsByTumorType, mutation.qcPassCountsByTumorType)
          : 0
    };
  });
}

function generateTumorTypeDecomposition(
  countsByTumorType: ICountByTumorType[],
  biallelicCountsByTumorType?: ICountByTumorType[],
  qcPassCountsByTumorType?: ICountByTumorType[]
) {
  let biallelicTumorMap: { [tumorType: string]: ICountByTumorType };
  let qcPassTumorMap: { [tumorType: string]: ICountByTumorType };

  if (biallelicCountsByTumorType && qcPassCountsByTumorType) {
    biallelicTumorMap = _.keyBy(biallelicCountsByTumorType, 'tumorType');
    qcPassTumorMap = _.keyBy(qcPassCountsByTumorType, 'tumorType');
  }

  return countsByTumorType.map(counts => ({
    ...counts,
    frequency: counts.variantCount / counts.tumorTypeCount,
    biallelicRatio:
      biallelicTumorMap && qcPassTumorMap ? calcBiallelicRatio(biallelicTumorMap[counts.tumorType], qcPassTumorMap[counts.tumorType]) : 0
  }));
}

export function calcBiallelicRatio(biallelicCountByTumorType?: ICountByTumorType, qcPassCountByTumorType?: ICountByTumorType) {
  const ratio =
    (biallelicCountByTumorType ? biallelicCountByTumorType.variantCount : 0) /
    (qcPassCountByTumorType ? qcPassCountByTumorType.variantCount : 0);

  return ratio || 0;
}

export function calculateTotalFrequency(
  mutations: IExtendedMutation[],
  mutationStatusFilter: MutationStatusFilter,
  cancerTypeFilter?: CancerTypeFilter
) {
  let frequency = 0;
  const filtered = mutations.filter(mutation => applyMutationStatusFilter(mutationStatusFilter, mutation));

  if (filtered.length > 0) {
    const variantCount = totalVariants(combinedTumorTypeDecompositions(filtered, cancerTypeFilter));
    const sampleCount = totalSamples(filterCountsByTumorType(filtered[0].tumorTypeDecomposition, cancerTypeFilter));

    frequency = variantCount / sampleCount;
  }

  return frequency;
}

export function calculateTotalBiallelicRatio(
  mutations: IExtendedMutation[],
  pathogenicGermlineFilter: MutationStatusFilter,
  biallelicPathogenicGermlineFilter: MutationStatusFilter,
  cancerTypeFilter?: CancerTypeFilter
) {
  let ratio;

  const pathogenicGermlineMutations = mutations.filter(mutation => applyMutationStatusFilter(pathogenicGermlineFilter, mutation));
  const biallelicPathogenicGermlineMutations = mutations.filter(mutation =>
    applyMutationStatusFilter(biallelicPathogenicGermlineFilter, mutation)
  );

  if (pathogenicGermlineMutations.length > 0 && biallelicPathogenicGermlineMutations.length > 0) {
    const combinedBiallelicCounts = combinedBiallelicCountsByTumorType(biallelicPathogenicGermlineMutations, cancerTypeFilter);
    const combinedQcPassCounts = combinedQcPassCountsByTumorType(pathogenicGermlineMutations, cancerTypeFilter);

    ratio = totalVariants(combinedBiallelicCounts) / totalVariants(combinedQcPassCounts);
  }

  return ratio || 0;
}

function combinedBiallelicCountsByTumorType(mutations: IExtendedMutation[], cancerTypeFilter?: CancerTypeFilter) {
  return combinedCounts(mutations, (mutation: IExtendedMutation) => mutation.biallelicCountsByTumorType, cancerTypeFilter);
}

function combinedQcPassCountsByTumorType(mutations: IExtendedMutation[], cancerTypeFilter?: CancerTypeFilter) {
  return combinedCounts(mutations, (mutation: IExtendedMutation) => mutation.qcPassCountsByTumorType, cancerTypeFilter);
}

function combinedTumorTypeDecompositions(mutations: IExtendedMutation[], cancerTypeFilter?: CancerTypeFilter) {
  return combinedCounts(mutations, (mutation: IExtendedMutation) => mutation.tumorTypeDecomposition, cancerTypeFilter);
}

function combinedCounts(
  mutations: IExtendedMutation[],
  getCounts: (mutation: IExtendedMutation) => ICountByTumorType[] | undefined,
  cancerTypeFilter?: CancerTypeFilter
) {
  return _.flatten(mutations.map(mutation => filterCountsByTumorType(getCounts(mutation), cancerTypeFilter)));
}

function filterCountsByTumorType(counts?: ICountByTumorType[], cancerTypeFilter?: CancerTypeFilter) {
  return counts ? counts.filter(c => containsCancerType(cancerTypeFilter, c.tumorType)) : [];
}

function totalVariants(counts: ICountByTumorType[]) {
  return counts.map(c => c.variantCount).reduce((acc, curr) => acc + curr, 0) || 0;
}

function totalSamples(counts: ICountByTumorType[]) {
  return counts.map(c => c.tumorTypeCount).reduce((acc, curr) => acc + curr, 0) || 0;
}

function calculateOverallFrequency(counts: ICountByTumorType[]) {
  return totalVariants(counts) / totalSamples(counts);
}

function calculateTotalVariantRatio(counts1: ICountByTumorType[], counts2: ICountByTumorType[]) {
  return totalVariants(counts1) / totalVariants(counts2);
}
