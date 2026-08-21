import {
  getHotspot,
  getHotspotResidue,
  getHotspotVariants,
} from 'app/pages/genePage/hotspot/HotspotUtils';
import { BiologicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
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

  it('is undefined for an in-frame indel, which sits on a range', () => {
    expect(
      getHotspotResidue(
        biologicalVariant(
          'T488_P492del',
          488,
          492,
          ONCOGENICITY.LIKELY_ONCOGENIC,
          'inframe_deletion'
        )
      )
    ).toBeUndefined();
    // A single position in-frame deletion still belongs to a range hotspot.
    expect(
      getHotspotResidue(
        biologicalVariant(
          'P191del',
          191,
          191,
          ONCOGENICITY.LIKELY_ONCOGENIC,
          'inframe_deletion',
          'P'
        )
      )
    ).toBeUndefined();
  });

  it('is undefined when the alteration has no reference residue', () => {
    expect(
      getHotspotResidue(
        biologicalVariant('Fusions', -1, 100000, ONCOGENICITY.ONCOGENIC, 'NA')
      )
    ).toBeUndefined();
  });
});

describe('getHotspotVariants', () => {
  it('keeps the hotspot alterations covering the position, most oncogenic first', () => {
    const v600 = getHotspot('BRAF', 'V600')!;
    const variants = getHotspotVariants(v600, [
      biologicalVariant('V600G', 600, 600, ONCOGENICITY.LIKELY_ONCOGENIC),
      biologicalVariant('D594N', 594, 594, ONCOGENICITY.LIKELY_ONCOGENIC),
      biologicalVariant('V600E', 600, 600, ONCOGENICITY.ONCOGENIC),
    ]);
    expect(variants.map(variant => variant.variant.name)).toEqual([
      'V600E',
      'V600G',
    ]);
  });

  it('drops alterations the backend did not flag as a hotspot', () => {
    const v600 = getHotspot('BRAF', 'V600')!;
    expect(
      getHotspotVariants(v600, [
        biologicalVariant(
          'V600',
          600,
          600,
          ONCOGENICITY.ONCOGENIC,
          undefined,
          'V',
          null
        ),
      ])
    ).toEqual([]);
  });

  it('drops a hotspot alteration of another type covering the position', () => {
    // L485_P490del covers the L485 single residue hotspot, but it is a hotspot
    // of the in-frame indel range it falls in, not of that residue.
    const l485 = getHotspot('BRAF', 'L485')!;
    const range = getHotspot('BRAF', '486-494')!;
    const deletion = biologicalVariant(
      'L485_P490del',
      485,
      490,
      ONCOGENICITY.LIKELY_ONCOGENIC,
      'inframe_deletion',
      undefined,
      'in-frame indel'
    );
    expect(getHotspotVariants(l485, [deletion])).toEqual([]);
    expect(getHotspotVariants(range, [deletion]).length).toEqual(1);
  });
});
