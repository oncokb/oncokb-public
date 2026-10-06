import {
  getHotspot,
  getHotspotResidue,
  getHotspotVariants,
} from 'app/pages/genePage/hotspot/HotspotUtils';
import {
  Alteration,
  BiologicalVariant,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { ONCOGENICITY } from 'app/config/constants';

const biologicalVariant = (
  alteration: string,
  proteinStart: number,
  proteinEnd: number,
  oncogenic: string,
  consequence?: string,
  refResidues?: string,
  hotspotType: string | null = 'single residue'
) =>
  (({
    oncogenic,
    hotspot: { isHotspot: !!hotspotType, type: hotspotType },
    variant: {
      alteration,
      name: alteration,
      proteinStart,
      proteinEnd,
      refResidues,
      consequence: consequence ? { term: consequence } : undefined,
    },
  } as unknown) as BiologicalVariant);

describe('getHotspot', () => {
  it('finds a single residue hotspot by residue', () => {
    const v600 = getHotspot('BRAF', 'V600');
    expect(v600).toBeDefined();
    expect(v600!.type).toEqual('single residue');
    expect(v600!.proteinStart).toEqual(600);
    expect(v600!.proteinEnd).toEqual(600);
  });

  it('finds a range hotspot by residue', () => {
    const range = getHotspot('CDKN2A', '27-42');
    expect(range).toBeDefined();
    expect(range!.type).toEqual('in-frame indel');
    expect(range!.proteinStart).toEqual(27);
    expect(range!.proteinEnd).toEqual(42);
  });

  it('returns undefined for an unknown residue or gene', () => {
    expect(getHotspot('CDKN2A', '1-2')).toBeUndefined();
    expect(getHotspot('NOT_A_GENE', '27-42')).toBeUndefined();
  });
});

describe('getHotspotResidue', () => {
  it('is the reference residue and position of a missense variant', () => {
    expect(
      getHotspotResidue(
        'BRAF',
        biologicalVariant(
          'V600E',
          600,
          600,
          ONCOGENICITY.ONCOGENIC,
          'missense_variant',
          'V'
        )
      )
    ).toEqual('V600');
  });

  it('drops the suffix of a splice variant', () => {
    expect(
      getHotspotResidue(
        'BRAF',
        biologicalVariant(
          'X380_splice',
          380,
          380,
          ONCOGENICITY.LIKELY_ONCOGENIC,
          'splice_region_variant'
        )
      )
    ).toEqual('X380');
  });

  it('is the in-frame indel range the indel overlaps', () => {
    expect(
      getHotspotResidue(
        'BRAF',
        biologicalVariant(
          'T488_P492del',
          488,
          492,
          ONCOGENICITY.LIKELY_ONCOGENIC,
          'inframe_deletion'
        )
      )
    ).toEqual('486-494');
    expect(
      getHotspotResidue(
        'TP53',
        biologicalVariant(
          'P191del',
          191,
          191,
          ONCOGENICITY.LIKELY_ONCOGENIC,
          'inframe_deletion',
          'P'
        )
      )
    ).toEqual('191-206');
  });

  it('is undefined when the alteration has no reference residue', () => {
    expect(
      getHotspotResidue(
        'BRAF',
        biologicalVariant('Fusions', -1, 100000, ONCOGENICITY.ONCOGENIC, 'NA')
      )
    ).toBeUndefined();
  });
});

describe('getHotspotVariants', () => {
  const curatedAlterations = (names: string[]) =>
    names.map(name => ({ alteration: name, name } as Alteration));

  it('keeps the alterations the hotspot endpoint lists, most oncogenic first', () => {
    const variants = getHotspotVariants(
      curatedAlterations(['V600E', 'V600G']),
      [
        biologicalVariant('V600G', 600, 600, ONCOGENICITY.LIKELY_ONCOGENIC),
        biologicalVariant('D594N', 594, 594, ONCOGENICITY.LIKELY_ONCOGENIC),
        biologicalVariant('V600E', 600, 600, ONCOGENICITY.ONCOGENIC),
      ]
    );
    expect(variants.map(variant => variant.variant.name)).toEqual([
      'V600E',
      'V600G',
    ]);
  });

  it('is empty when the hotspot has no curated alterations', () => {
    expect(
      getHotspotVariants(curatedAlterations([]), [
        biologicalVariant('V600E', 600, 600, ONCOGENICITY.ONCOGENIC),
      ])
    ).toEqual([]);
  });
});
