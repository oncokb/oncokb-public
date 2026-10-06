import {
  Alteration,
  BiologicalVariant,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { ONCOGENICITY } from 'app/config/constants';
import { oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';
import hotspotsByGene from './hotspots.json';

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

export function getHotspot(
  hugoSymbol: string,
  residue: string
): Hotspot | undefined {
  return getGeneHotspots(hugoSymbol).find(
    hotspot => hotspot.residue === residue
  );
}

const RANGE_CONSEQUENCES = ['inframe_deletion', 'inframe_insertion'];

const SPLICE_SUFFIX = '_splice';

export function getHotspotResidue(
  hugoSymbol: string,
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
    variant.hotspot?.type === HOTSPOT_TYPE.IN_FRAME_INDEL ||
    (consequence && RANGE_CONSEQUENCES.includes(consequence))
  ) {
    return getGeneHotspots(hugoSymbol).find(
      hotspot =>
        hotspot.type === HOTSPOT_TYPE.IN_FRAME_INDEL &&
        alteration.proteinStart <= hotspot.proteinEnd &&
        alteration.proteinEnd >= hotspot.proteinStart
    )?.residue;
  }
  if (
    !alteration.refResidues ||
    alteration.proteinStart !== alteration.proteinEnd
  ) {
    return undefined;
  }
  return `${alteration.refResidues}${alteration.proteinStart}`;
}

export function getHotspotVariants(
  curatedAlterations: Alteration[],
  biologicalVariants: BiologicalVariant[]
): BiologicalVariant[] {
  const alterations = new Set(
    curatedAlterations.map(alteration => alteration.alteration)
  );
  return biologicalVariants
    .filter(variant => alterations.has(variant.variant.alteration))
    .sort((a, b) =>
      oncogenicitySortMethod(
        a.oncogenic as ONCOGENICITY,
        b.oncogenic as ONCOGENICITY
      )
    );
}

export function getHotspotCuratedAlterationsDescription(
  hugoSymbol: string,
  hotspot: Pick<Hotspot, 'residue' | 'type'>
): string {
  const residue = hotspot.residue;
  switch (hotspot.type) {
    case HOTSPOT_TYPE.IN_FRAME_INDEL:
      return `The following in-frame indels overlapping residues ${residue.replace(
        '-',
        '_'
      )} in ${hugoSymbol} are specifically curated in OncoKB.`;
    case HOTSPOT_TYPE.SPLICE_SITE:
      return `The following splice site mutations at the ${hugoSymbol} ${residue} hotspot have their own individual curations in OncoKB.`;
    default:
      return `The following missense mutations at the ${hugoSymbol} ${residue} hotspot have their own individual curations in OncoKB.`;
  }
}
