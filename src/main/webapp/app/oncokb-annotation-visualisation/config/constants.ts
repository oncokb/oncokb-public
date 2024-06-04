import { default as URL } from 'url';

export const ONCOGENIC_MUTATIONS = 'Oncogenic Mutations';
export const FUSIONS = 'Fusions';
export const TRUNCATING_MUTATIONS = 'Truncating Mutations';
export const GAIN_OF_FUNCTION_MUTATIONS = 'Gain-of-function Mutations';
export const LOSS_OF_FUNCTION_MUTATIONS = 'Loss-of-function Mutations';
export const SWITCH_OF_FUNCTION_MUTATIONS = 'Switch-of-function Mutations';

export const CATEGORICAL_ALTERATIONS = [
  ONCOGENIC_MUTATIONS,
  FUSIONS,
  TRUNCATING_MUTATIONS,
  GAIN_OF_FUNCTION_MUTATIONS,
  LOSS_OF_FUNCTION_MUTATIONS,
  SWITCH_OF_FUNCTION_MUTATIONS,
];

type AnnotationPageSearchQueries = {
  refGenome?: REFERENCE_GENOME;
  tumorType?: string;
};
type AnnotationPageHashQueries = {
  tab?: ANNOTATION_PAGE_TAB_KEYS;
};

export type GenePageSearchQueries = AnnotationPageSearchQueries & {};
export type GenePageHashQueries = AnnotationPageHashQueries & {};

export type AlterationPageSearchQueries = AnnotationPageSearchQueries & {};
export type AlterationPageHashQueries = AnnotationPageHashQueries & {};

export enum ANNOTATION_PAGE_TAB_KEYS {
  BIOLOGICAL = 'Biological',
  TX = 'Tx',
  DX = 'Dx',
  PX = 'Px',
  FDA = 'FDA',
}

export enum Version {
  V1 = 'V1',
  V2 = 'V2',
  FDA = 'FDA',
  FDA_NGS = 'FDA_NGS',
  AAC = 'AAC',
  DX = 'DX',
  PX = 'PX',
}

export enum REFERENCE_GENOME {
  GRCh37 = 'GRCh37',
  GRCh38 = 'GRCh38',
}

export const DEFAULT_REFERENCE_GENOME = REFERENCE_GENOME.GRCh37;

export const HOSTNAME = 'https://www.oncokb.org';

export enum PAGE_ROUTE {
  GENE_HEADER = '/gene',
  DX = '/diagnostic-levels',
  PX = '/prognostic-levels',
  V2 = '/therapeutic-levels',
  FDA_NGS = '/fda-levels',
}

export enum PAGE_TITLE {
  V1 = 'OncoKB™ Therapeutic Level of Evidence V1',
  V2 = 'OncoKB™ Therapeutic Level of Evidence V2',
  FDA = 'Mapping between the OncoKB™ Levels of Evidence and the FDA Levels of Evidence',
  AAC = 'Mapping between the OncoKB™ Levels of Evidence and the AMP/ASCO/CAP Consensus Recommendation',
  FDA_NGS = 'FDA fact sheet',
}

export enum MUTATIONS_TABLE_COLUMN_KEY {
  GENE = 'GENE',
  MUTATION = 'MUTATION',
  CONSEQUENCE_TYPE = 'CONSEQUENCE_TYPE',
  LOCATION = 'LOCATION',
  ONCOGENICITY = 'ONCOGENICITY',
  BIOLOGICAL_EFFECT = 'BIOLOGICAL_EFFECT',
  DRUG = 'DRUG',
  LEVEL = 'LEVEL',
  BIOMARKER = 'BIOMARKER',
  ANNOTATION = 'ANNOTATION',
}
export const TOOLTIP_MAX_HEIGHT = 300;
export const LG_TABLE_FIXED_HEIGHT = 640;
export const THRESHOLD_TABLE_FIXED_HEIGHT = 15;
export const LONG_TEXT_CUTOFF = 200;

export enum ONCOGENICITY {
  ONCOGENIC = 'Oncogenic',
  LIKELY_ONCOGENIC = 'Likely Oncogenic',
  PREDICTED_ONCOGENIC = 'Predicted Oncogenic',
  RESISTANCE = 'Resistance',
  LIKELY_NEUTRAL = 'Likely Neutral',
  NEUTRAL = 'Neutral',
  INCONCLUSIVE = 'Inconclusive',
  UNKNOWN = 'Unknown',
}

export enum MUTATION_EFFECT {
  GAIN_OF_FUNCTION = 'Gain-of-function',
  LIKELY_GAIN_OF_FUNCTION = 'Likely Gain-of-function',
  LOSS_OF_FUNCTION = 'Loss-of-function',
  LIKELY_LOSS_OF_FUNCTION = 'Likely Loss-of-function',
  SWITCH_OF_FUNCTION = 'Switch-of-function',
  LIKELY_SWITCH_OF_FUNCTION = 'Likely Switch-of-function',
  NEUTRAL = 'Neutral',
  LIKELY_NEUTRAL = 'Likely Neutral',
  INCONCLUSIVE = 'Inconclusive',
  UNKNOWN = 'Unknown',
}

export enum NOTIFICATION_TYPE {
  INFO = 'primary',
  ERROR = 'danger',
  WARNING = 'warning',
  SUCCESS = 'success',
}

export type AnnotationImplication = {
  level: string;
  gene: string;
  mutation: string;
  consequenceType: string;
  drug: string;
  location: string;
  oncogenicity: string;
  biologicalEffect: string;
  alterationType: string;
};

export type TreatmentImplication = {
  biomarker: string;
  drug: string;
  level: string;
  annotation: string;
  alterationType: string;
};

export type NotificationImplication = {
  message: string;
  type: NOTIFICATION_TYPE;
  alterationType: string;
};

export type QueryParams = {
  [key: string]: undefined | null | string | string[];
};

export type BuildUrlParams = {
  pathname: string;
  query?: QueryParams;
  hash?: string;
};

export function getNCBIlink(
  pathnameOrParams?: BuildUrlParams | string
): string {
  const params =
    typeof pathnameOrParams === 'string'
      ? { pathname: pathnameOrParams }
      : pathnameOrParams;
  return URL.format({
    protocol: 'https',
    host: 'www.ncbi.nlm.nih.gov',
    ...params,
  });
}

export function getNCTlink(pathnameOrParams?: BuildUrlParams | string): string {
  const params =
    typeof pathnameOrParams === 'string'
      ? { pathname: pathnameOrParams }
      : pathnameOrParams;
  return URL.format({
    protocol: 'https',
    host: 'www.clinicaltrials.gov',
    ...params,
  });
}

// example reference groups to capture:
//     (PMID: 11900253)
//     (PMID: 11753428, 16007150, 21467160)
//     (NCT1234567)
export const REF_CAPTURE = /(\(\s*(?:PMID|NCT|Abstract):?.*?\))/i;

export enum LEVEL_TYPES {
  TX = 'Tx',
  DX = 'Dx',
  PX = 'Px',
  FDA = 'FDA',
}

export enum LEVELS {
  Dx1 = 'Dx1',
  Dx2 = 'Dx2',
  Dx3 = 'Dx3',
  Px1 = 'Px1',
  Px2 = 'Px2',
  Px3 = 'Px3',
  Tx1 = '1',
  Tx2 = '2',
  Tx3 = '3',
  Tx3A = '3A',
  Tx3B = '3B',
  Tx4 = '4',
  R1 = 'R1',
  R2 = 'R2',
  Fda1 = 'Fda1',
  Fda2 = 'Fda2',
  Fda3 = 'Fda3',
}

export const LEVEL_PRIORITY: LEVELS[] = [
  LEVELS.Fda3,
  LEVELS.Fda2,
  LEVELS.Fda1,
  LEVELS.Px3,
  LEVELS.Px2,
  LEVELS.Px1,
  LEVELS.Dx3,
  LEVELS.Dx2,
  LEVELS.Dx1,
  LEVELS.R2,
  LEVELS.Tx4,
  LEVELS.Tx3B,
  LEVELS.Tx3A,
  LEVELS.Tx3,
  LEVELS.Tx2,
  LEVELS.R1,
  LEVELS.Tx1,
];
