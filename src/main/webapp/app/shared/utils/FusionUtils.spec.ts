import { getCanonicalFusionAlteration } from 'app/shared/utils/Utils';

describe('getCanonicalFusionAlteration', () => {
  it('returns the canonical name when the API normalized a hyphen fusion', () => {
    expect(
      getCanonicalFusionAlteration('BCR-ABL1 Fusion', 'BCR::ABL1 Fusion')
    ).toEqual('BCR::ABL1 Fusion');
  });

  it('returns undefined when the query is already canonical', () => {
    expect(
      getCanonicalFusionAlteration('BCR::ABL1 Fusion', 'BCR::ABL1 Fusion')
    ).toBeUndefined();
  });

  it('leaves normalized protein changes alone', () => {
    expect(getCanonicalFusionAlteration('Val600Glu', 'V600E')).toBeUndefined();
    expect(getCanonicalFusionAlteration('v600e', 'V600E')).toBeUndefined();
  });

  it('leaves categorical alterations alone', () => {
    expect(getCanonicalFusionAlteration('Fusions', 'Fusions')).toBeUndefined();
  });

  // An ambiguous query is rejected by the API rather than normalized, so there is
  // nothing to redirect to.
  it('returns undefined when an ambiguous fusion was not normalized', () => {
    expect(
      getCanonicalFusionAlteration('NKX3-1-ABL1 Fusion', 'NKX3-1-ABL1 Fusion')
    ).toBeUndefined();
  });

  it('handles missing values', () => {
    expect(
      getCanonicalFusionAlteration(undefined, 'BCR::ABL1 Fusion')
    ).toBeUndefined();
    expect(
      getCanonicalFusionAlteration('BCR-ABL1 Fusion', undefined)
    ).toBeUndefined();
    expect(getCanonicalFusionAlteration('', '')).toBeUndefined();
  });
});
