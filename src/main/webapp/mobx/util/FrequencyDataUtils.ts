import { IGeneFrequencySummary, ITumorTypeFrequencySummary } from '../../../server/src/model/GeneFrequencySummary';

export function fetchTumorTypeFrequenciesByGene(hugoSymbol: string): Promise<ITumorTypeFrequencySummary[]> {
  return new Promise<ITumorTypeFrequencySummary[]>((resolve, reject) => {
    fetch(`/api/frequency/tumorType/byGene?hugoSymbol=${hugoSymbol}`)
      .then(response => resolve(response.json()))
      .catch(err => reject(err));
  });
}

export function fetchFrequencySummaryByGene(): Promise<IGeneFrequencySummary[]> {
  return new Promise<IGeneFrequencySummary[]>((resolve, reject) => {
    fetch('/api/frequency/summary/byGene')
      .then(response => resolve(response.json()))
      .catch(err => reject(err));
  });
}
