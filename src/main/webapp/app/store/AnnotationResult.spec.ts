import { DEFAULT_ANNOTATION } from 'app/config/constants';
import {
  AnnotationResult,
  isInvalidVariantAnnotation,
  normalizeVariantAnnotation,
} from 'app/store/AnnotationResult';

describe('AnnotationResult', () => {
  it('treats empty unknown responses with variantExist false as invalid', () => {
    expect(isInvalidVariantAnnotation(DEFAULT_ANNOTATION)).toBe(true);
  });

  it('does not treat mapped annotations as invalid when variantExist is false', () => {
    const annotation = {
      ...DEFAULT_ANNOTATION,
      variantSummary: 'The APC G279Ffs*10 is a truncating mutation.',
    };

    expect(isInvalidVariantAnnotation(annotation)).toBe(false);
  });

  it('treats non-unknown oncogenicity as known annotation', () => {
    const annotation = {
      ...DEFAULT_ANNOTATION,
      oncogenic: 'Likely Oncogenic',
    };

    expect(isInvalidVariantAnnotation(annotation)).toBe(false);
  });

  it('supports a discriminated union for invalid annotations', () => {
    const result: AnnotationResult = {
      kind: 'invalid',
      annotation: DEFAULT_ANNOTATION,
      message:
        'This alteration appears to be invalid and could not be annotated.',
    };

    expect(result.kind).toBe('invalid');
    expect(result.annotation).toBe(DEFAULT_ANNOTATION);
  });

  it('normalizes missing nested annotation arrays upstream', () => {
    const annotation = normalizeVariantAnnotation({
      ...DEFAULT_ANNOTATION,
      tumorTypes: [
        {
          evidences: [
            {
              alterations: undefined as any,
              articles: undefined as any,
              cancerTypes: undefined as any,
              excludedCancerTypes: undefined as any,
              tags: undefined as any,
              treatments: undefined as any,
            } as any,
          ],
        } as any,
      ],
    });

    expect(annotation.tumorTypes[0].evidences[0].alterations).toEqual([]);
    expect(annotation.tumorTypes[0].evidences[0].tags).toEqual([]);
    expect(annotation.tumorTypes[0].evidences[0].treatments).toEqual([]);
  });
});
