import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { getCancerTypeNameFromOncoTreeType } from 'app/shared/utils/Utils';

const relevantCancerTypesCache: {
  [cancerType: string]: Promise<string[]>;
} = {};
const resolvedRelevantCancerTypes: { [cancerType: string]: string[] } = {};

export function fetchRelevantCancerTypeNames(
  cancerType: string
): Promise<string[]> {
  if (relevantCancerTypesCache[cancerType] === undefined) {
    relevantCancerTypesCache[cancerType] = privateClient
      .utilRelevantTumorTypesGetUsingGET({ tumorType: cancerType })
      .then(cancerTypes => {
        const names = cancerTypes.map(getCancerTypeNameFromOncoTreeType);
        resolvedRelevantCancerTypes[cancerType] = names;
        return names;
      })
      .catch(error => {
        delete relevantCancerTypesCache[cancerType];
        throw error;
      });
  }
  return relevantCancerTypesCache[cancerType];
}

export function prefetchRelevantCancerTypeNames(
  cancerTypes: Iterable<string>
): Promise<void> {
  return Promise.all(
    Array.from(cancerTypes).map(cancerType =>
      fetchRelevantCancerTypeNames(cancerType).catch(() => undefined)
    )
  ).then(() => undefined);
}

export function matchesCancerTypeFilter(
  rowCancerTypes: string[],
  rowExcludedCancerTypes: string[],
  selectedCancerTypes: Set<string>
): boolean {
  return Array.from(selectedCancerTypes).some(selected => {
    const relevant = resolvedRelevantCancerTypes[selected] || [selected];
    return (
      rowCancerTypes.some(cancerType => relevant.includes(cancerType)) &&
      !rowExcludedCancerTypes.some(cancerType => relevant.includes(cancerType))
    );
  });
}
