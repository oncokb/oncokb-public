import { addPromoterMutationLabel, isPromoterGenomicAlteration } from './Utils';

describe('isPromoterGenomicAlteration', () => {
  it('is true for TERT genomic alterations', () => {
    expect(isPromoterGenomicAlteration('TERT', 'g.1295228G>A')).toBeTruthy();
    expect(isPromoterGenomicAlteration('tert', 'g.1295228G>A')).toBeTruthy();
  });

  it('is true for TERT genomic alterations with a reference sequence prefix', () => {
    expect(isPromoterGenomicAlteration('TERT', '5:g.1295228G>A')).toBeTruthy();
    expect(
      isPromoterGenomicAlteration('TERT', '5:g.1295228_1295229delinsAA')
    ).toBeTruthy();
    expect(
      isPromoterGenomicAlteration('TERT', 'NC_000005.9:g.1295228G>A')
    ).toBeTruthy();
  });

  it('is false for non genomic TERT alterations', () => {
    expect(isPromoterGenomicAlteration('TERT', 'C228T')).toBeFalsy();
    expect(
      isPromoterGenomicAlteration('TERT', 'Promoter Mutations')
    ).toBeFalsy();
  });

  it('is false for other genes', () => {
    expect(isPromoterGenomicAlteration('BRAF', 'g.140453136A>T')).toBeFalsy();
    expect(isPromoterGenomicAlteration(undefined, 'g.1295113G>A')).toBeFalsy();
  });
});

describe('addPromoterMutationLabel', () => {
  it('appends the label to the alteration name', () => {
    expect(addPromoterMutationLabel('g.1295113G>A')).toEqual(
      'g.1295113G>A (Promoter mutation)'
    );
  });

  it('appends the label to a name that already shows the alteration diff', () => {
    expect(addPromoterMutationLabel('C228T (g.1295113G>A)')).toEqual(
      'C228T (g.1295113G>A) (Promoter mutation)'
    );
  });

  it('appends the label to the curated names as they come from the API', () => {
    expect(addPromoterMutationLabel('5:g.1295228G>A {c.-124C>T}')).toEqual(
      '5:g.1295228G>A {c.-124C>T} (Promoter mutation)'
    );
  });

  it('does not label a name that already says promoter', () => {
    expect(addPromoterMutationLabel('TERT Promoter Mutation')).toEqual(
      'TERT Promoter Mutation'
    );
    expect(
      addPromoterMutationLabel('TERT Promoter Mutation (g.1295113G>A)')
    ).toEqual('TERT Promoter Mutation (g.1295113G>A)');
  });
});
