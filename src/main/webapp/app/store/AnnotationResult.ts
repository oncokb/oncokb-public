import { MUTATION_EFFECT, ONCOGENICITY } from 'app/config/constants';
import {
  GermlineVariantAnnotation,
  VariantAnnotation as ApiVariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';

type VariantAnnotation = ApiVariantAnnotation | GermlineVariantAnnotation;

export type ValidAnnotation = {
  kind: 'valid';
  annotation: VariantAnnotation;
};

export type InvalidAnnotation = {
  kind: 'invalid';
  annotation: VariantAnnotation;
  message: string;
};

export type AnnotationResult = ValidAnnotation | InvalidAnnotation;

export function normalizeVariantAnnotation<T extends VariantAnnotation>(
  annotation: T
): T {
  return {
    ...annotation,
    treatments: annotation.treatments ?? [],
    tumorTypes: (annotation.tumorTypes ?? []).map(tumorType => ({
      ...tumorType,
      evidences: (tumorType.evidences ?? []).map(evidence => ({
        ...evidence,
        alterations: evidence.alterations ?? [],
        articles: evidence.articles ?? [],
        cancerTypes: evidence.cancerTypes ?? [],
        excludedCancerTypes: evidence.excludedCancerTypes ?? [],
        tags: evidence.tags ?? [],
        treatments: (evidence.treatments ?? []).map(treatment => ({
          ...treatment,
          drugs: treatment.drugs ?? [],
        })),
      })),
    })),
  } as T;
}

export function isInvalidVariantAnnotation(annotation: VariantAnnotation) {
  if (!('oncogenic' in annotation)) {
    return false;
  }

  return (
    !annotation.variantExist &&
    (!annotation.oncogenic || annotation.oncogenic === ONCOGENICITY.UNKNOWN) &&
    !annotation.variantSummary
  );
}
