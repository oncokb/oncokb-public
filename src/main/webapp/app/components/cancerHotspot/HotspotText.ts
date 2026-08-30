import { HOTSPOT_TYPE } from 'app/pages/genePage/hotspot/HotspotUtils';

/**
 * MOCK COPY — the wording below comes from the curation team's hotspot page
 * mockup and is hardcoded in the frontend until the API returns it.
 *
 * The text is generic for every hotspot: only the gene, the residue and the
 * kind of mutation the hotspot covers change. It is used on hotspot pages
 * where {ONCOKB_TM} has no curated text of its own — a curated summary or
 * mutation effect description always wins and is never replaced by this.
 *
 * NOT INCLUDED YET: the sentence listing which alterations at the position are
 * specifically curated ("The following single residue BRAF V600 mutations are
 * specifically curated in OncoKB: ..."). It needs the backend to report the
 * curated alterations of a hotspot, so it is omitted for now.
 */

// How the hotspot's mutations are referred to in the copy, per hotspot type.
const MUTATION_NOUN: { [type: string]: string } = {
  [HOTSPOT_TYPE.SINGLE_RESIDUE]: 'single residue mutations',
  [HOTSPOT_TYPE.IN_FRAME_INDEL]: 'in-frame indels',
  [HOTSPOT_TYPE.SPLICE_SITE]: 'splice site mutations',
};

const getMutationNoun = (hotspotType: string) =>
  MUTATION_NOUN[hotspotType] ?? 'mutations';

// The papers the hotspot characterization is based on. Rendered as references
// by SummaryWithRefs, the same way curated descriptions cite their sources.
const HOTSPOT_PMIDS = '(PMID: 29247016, 26619011, 41895280)';

const getHotspotSentence = (
  hugoSymbol: string,
  residue: string,
  hotspotType: string,
  withReferences: boolean
) =>
  `${hugoSymbol} ${residue} has been identified as a statistically significant hotspot and ${getMutationNoun(
    hotspotType
  )} at this position are considered likely oncogenic${
    withReferences ? ` ${HOTSPOT_PMIDS}` : ''
  } unless functional evidence suggests otherwise.`;

export const getHotspotSummary = (
  hugoSymbol: string,
  residue: string,
  hotspotType: string
) => getHotspotSentence(hugoSymbol, residue, hotspotType, false);

export const getHotspotMutationEffectDescription = (
  hugoSymbol: string,
  residue: string,
  hotspotType: string
) =>
  `${getHotspotSentence(
    hugoSymbol,
    residue,
    hotspotType,
    true
  )} Hotspot characterization is based on recurrence of mutations at this residue across independent tumors at a frequency significantly above the neutral background mutation rate, after correcting for gene length, sequence composition, and mutational signatures. Such recurrence is a hallmark of positive selection, indicating that mutations at this position confer a growth or fitness advantage and are therefore likely to be driver rather than passenger events.`;
