import { IGeneFrequencySummary } from '../../../server/src/model/GeneFrequencySummary';

// TODO duplicate server side code, remove after resolving import from server issues
export enum FrequencySummaryCategory {
  DEFAULT = 'NA',
  SOMATIC_DRIVER = 'somaticDriverByGene',
  PATHOGENIC_GERMLINE = 'pathogenicGermlineByGene',
  PERCENT_BIALLELIC = 'percentBiallelicByGene'
}

export function somaticAccessor(frequencySummary: IGeneFrequencySummary) {
  const somaticFrequencies = frequencySummary.frequencies.filter(f => f.category === FrequencySummaryCategory.SOMATIC_DRIVER);

  return somaticFrequencies.length > 0 ? somaticFrequencies[0].frequency : null;
}

export function germlineAccessor(frequencySummary: IGeneFrequencySummary) {
  const germlineFrequencies = frequencySummary.frequencies.filter(f => f.category === FrequencySummaryCategory.PATHOGENIC_GERMLINE);

  return germlineFrequencies.length > 0 ? germlineFrequencies[0].frequency : null;
}

export function biallelicAccessor(frequencySummary: IGeneFrequencySummary) {
  const biallelicFrequencies = frequencySummary.frequencies.filter(f => f.category === FrequencySummaryCategory.PERCENT_BIALLELIC);

  return biallelicFrequencies.length > 0 ? biallelicFrequencies[0].frequency : null;
}
