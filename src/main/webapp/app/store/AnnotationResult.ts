import { MUTATION_EFFECT, ONCOGENICITY } from 'app/config/constants';
import { VariantAnnotation } from 'app/shared/api/generated/OncoKbPrivateAPI';

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

export function normalizeVariantAnnotation(
  annotation: VariantAnnotation
): VariantAnnotation {
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
  };
}

export function isInvalidVariantAnnotation(annotation: VariantAnnotation) {
  return (
    !annotation.variantExist && annotation.oncogenic === ONCOGENICITY.UNKNOWN
  );
}
