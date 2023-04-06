import {
  FdaImplication,
  TherapeuticImplication,
} from 'app/store/AnnotationStore';
import _ from 'lodash';
import { LEVEL_PRIORITY, LEVELS, PAGE_ROUTE } from 'app/config/constants';
import { VariantAnnotation } from 'app/shared/api/generated/OncoKbPrivateAPI';

const getFdaImplicationKey = (fdaImplication: FdaImplication) => {
  return `${fdaImplication.alteration.alteration}-${fdaImplication.cancerType}`;
};
export const getUniqueFdaImplications = (
  fdaImplications: FdaImplication[]
): FdaImplication[] => {
  const uniqueData: { [key: string]: FdaImplication[] } = _.groupBy(
    fdaImplications,
    (fdaImplication: FdaImplication) => {
      return getFdaImplicationKey(fdaImplication);
    }
  );
  const finalList: FdaImplication[] = [];
  for (const key in uniqueData) {
    if (uniqueData[key].length > 0) {
      finalList.push(
        _.sortBy(uniqueData[key], fdaImplication => {
          return LEVEL_PRIORITY.indexOf(fdaImplication.level as LEVELS);
        })[0]
      );
    }
  }
  return finalList;
};

export const sortTherapeuticImplications = (
  implications: TherapeuticImplication[],
  desc = true
) => {
  return implications.sort(
    (a, b) =>
      (LEVEL_PRIORITY.indexOf(a.level as LEVELS) -
        LEVEL_PRIORITY.indexOf(b.level as LEVELS)) *
      (desc ? -1 : 1)
  );
};

export enum SummaryKey {
  GENE_SUMMARY = 'geneSummary',
  ALTERATION_SUMMARY = 'variantSummary',
  TUMOR_TYPE_SUMMARY = 'tumorTypeSummary',
  DIAGNOSTIC_SUMMARY = 'diagnosticSummary',
  PROGNOSTIC_SUMMARY = 'prognosticSummary',
}

const SUMMARY_TITLE = {
  [SummaryKey.GENE_SUMMARY]: 'Gene Summary',
  [SummaryKey.ALTERATION_SUMMARY]: 'Alteration Summary',
  [SummaryKey.TUMOR_TYPE_SUMMARY]: 'Therapeutic Summary',
  [SummaryKey.DIAGNOSTIC_SUMMARY]: 'Diagnostic Summary',
  [SummaryKey.PROGNOSTIC_SUMMARY]: 'Prognostic Summary',
};

export const getSummaries = (
  annotation: VariantAnnotation,
  orderedSummaries: string[]
) => {
  return _.reduce(
    orderedSummaries,
    (acc, next) => {
      if (annotation[next]) {
        acc.push({
          key: next,
          title: SUMMARY_TITLE[next],
          content: annotation[next],
        });
      }
      return acc;
    },
    [] as { key: string; title: string; content: string }[]
  );
};
