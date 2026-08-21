import { BiologicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { ONCOGENICITY } from 'app/config/constants';
import { oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';
import hotspotsByGene from './hotspots.json';

/**
 * TEMPORARY — REMOVE WHEN THE HOTSPOT API IS READY.
 *
 * hotspots.json is a build-time copy of
 * core/src/main/resources/data/hotspots_v2_and_3d.txt from the oncokb repo
 * (branch feature/hotspot-v3, commit 9bfba54), with the `3d` rows dropped to
 * match HotspotUtils.isHotspot(), which never matches them.
 *
 * Everything in this file exists only because there is no
 * GET /utils/hotspots/gene/{hugoSymbol} endpoint yet. Once that ships:
 *   - delete hotspots.json and this file,
 *   - read the hotspot a variant belongs to off the annotation,
 *   - drop the client-side position matching below.
 */

export enum HOTSPOT_TYPE {
  SINGLE_RESIDUE = 'single residue',
  IN_FRAME_INDEL = 'in-frame indel',
  SPLICE_SITE = 'splice site',
}

export const HOTSPOT_TYPE_LABEL: { [type: string]: string } = {
  [HOTSPOT_TYPE.SINGLE_RESIDUE]: 'Single residue',
  [HOTSPOT_TYPE.IN_FRAME_INDEL]: 'In-frame indel',
  [HOTSPOT_TYPE.SPLICE_SITE]: 'Splice site',
};

export type Hotspot = {
  residue: string;
  proteinStart: number;
  proteinEnd: number;
  type: string;
  tumorCount: number;
};

function getGeneHotspots(hugoSymbol: string): Hotspot[] {
  return (
    (hotspotsByGene as { [hugoSymbol: string]: Hotspot[] })[hugoSymbol] ?? []
  );
}

/**
 * Whether a curated alteration belongs to this hotspot. Which hotspots an
 * alteration matches is the backend's call — the `hotspot` annotation on the
 * variant already accounts for consequence, reference residues and type.
 * Matching the type matters: an in-frame indel covering a single residue
 * hotspot is a hotspot of the range it falls in, not of that residue. All that
 * is left here is picking which hotspot of that type it sits on, by position.
 */
function isOnHotspot(hotspot: Hotspot, variant: BiologicalVariant) {
  if (variant.hotspot?.type !== hotspot.type) {
    return false;
  }
  return (
    variant.variant.proteinStart <= hotspot.proteinEnd &&
    variant.variant.proteinEnd >= hotspot.proteinStart
  );
}

export function getHotspot(
  hugoSymbol: string,
  residue: string
): Hotspot | undefined {
  return getGeneHotspots(hugoSymbol).find(
    hotspot => hotspot.residue === residue
  );
}

// In-frame indels belong to a hotspot range, which has no single residue to
// link to — a range covers both insertions and deletions.
const RANGE_CONSEQUENCES = ['inframe_deletion', 'inframe_insertion'];

const SPLICE_SUFFIX = '_splice';

/**
 * The hotspot position page an alteration on a hotspot links to, derived from
 * the alteration itself: a missense variant at 600 with reference residue V is
 * on the V600 hotspot, and X380_splice is on the X380 one. Undefined when the
 * alteration has no single residue of its own — an in-frame indel, which sits
 * on a range whose linkout is omitted for now.
 */
export function getHotspotResidue(
  variant: BiologicalVariant
): string | undefined {
  const alteration = variant.variant;
  if (alteration.name.endsWith(SPLICE_SUFFIX)) {
    return alteration.name.slice(0, -SPLICE_SUFFIX.length);
  }
  const consequence = alteration.consequence
    ? alteration.consequence.term
    : undefined;
  if (
    !alteration.refResidues ||
    alteration.proteinStart !== alteration.proteinEnd ||
    (consequence && RANGE_CONSEQUENCES.includes(consequence))
  ) {
    return undefined;
  }
  return `${alteration.refResidues}${alteration.proteinStart}`;
}

/**
 * The curated alterations of a hotspot, most oncogenic first — what the
 * hotspot page lists as the OncoKB annotated mutations at the position.
 */
export function getHotspotVariants(
  hotspot: Hotspot,
  biologicalVariants: BiologicalVariant[]
): BiologicalVariant[] {
  return biologicalVariants
    .filter(variant => isOnHotspot(hotspot, variant))
    .sort((a, b) =>
      oncogenicitySortMethod(
        a.oncogenic as ONCOGENICITY,
        b.oncogenic as ONCOGENICITY
      )
    );
}
