import { OncoKBInfo, Gene } from 'app/shared/api/generated/OncoKbAPI';
import { MainNumber, VariantAnnotation } from 'app/shared/api/generated/OncoKbPrivateAPI';

/* eslint no-shadow: 0 */

const config = {
  VERSION: process.env.VERSION
};

export default config;

export const SERVER_API_URL = process.env.SERVER_API_URL;

export const AUTHORITIES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER'
};

export const messages = {
  DATA_ERROR_ALERT: 'Internal Error'
};

export const APP_DATE_FORMAT = 'DD/MM/YY HH:mm';
export const APP_TIMESTAMP_FORMAT = 'DD/MM/YY HH:mm:ss';
export const APP_LOCAL_DATE_FORMAT = 'DD/MM/YYYY';
export const APP_LOCAL_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm';
export const APP_LOCAL_DATETIME_FORMAT_Z = 'YYYY-MM-DDTHH:mm Z';
export const APP_WHOLE_NUMBER_FORMAT = '0,0';
export const APP_TWO_DIGITS_AFTER_POINT_NUMBER_FORMAT = '0,0.[00]';

export const ONCOKB_CONTACT_EMAIL = 'contact@oncokb.org';
export const GRID_BREAKPOINTS = {
  LG: 980,
  XL: 1450
};

export enum ONCOGENICITY {
  ONCOGENIC = 'Oncogenic',
  LIKELY_ONCOGENIC = 'Likely Oncogenic',
  PREDICTED_ONCOGENIC = 'Predicted Oncogenic',
  LIKELY_NEUTRAL = 'Likely Neutral',
  NEUTRAL = 'Neutral',
  INCONCLUSIVE = 'Inconclusive',
  UNKNOWN = 'Unknown'
}

export const GENERAL_ONCOGENICITY: { [key: string]: ONCOGENICITY } = {
  [ONCOGENICITY.ONCOGENIC]: ONCOGENICITY.ONCOGENIC,
  [ONCOGENICITY.LIKELY_ONCOGENIC]: ONCOGENICITY.ONCOGENIC,
  [ONCOGENICITY.PREDICTED_ONCOGENIC]: ONCOGENICITY.ONCOGENIC,
  [ONCOGENICITY.NEUTRAL]: ONCOGENICITY.NEUTRAL,
  [ONCOGENICITY.LIKELY_NEUTRAL]: ONCOGENICITY.NEUTRAL,
  [ONCOGENICITY.INCONCLUSIVE]: ONCOGENICITY.INCONCLUSIVE,
  [ONCOGENICITY.UNKNOWN]: ONCOGENICITY.UNKNOWN
};

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
  UNKNOWN = 'Unknown'
}

const EVIDENCE_TYPE = {
  FDA_APPROVED: 'FDA-approved',
  STANDARD_CARE: 'Standard care',
  CLINICAL_EVIDENCE: 'Clinical evidence',
  BIOLOGICAL_EVIDENCE: 'Biological evidence'
};

export const LEVEL_BUTTON_DESCRIPTION = {
  '1': EVIDENCE_TYPE.FDA_APPROVED,
  '2': EVIDENCE_TYPE.STANDARD_CARE,
  '3': EVIDENCE_TYPE.CLINICAL_EVIDENCE,
  '4': EVIDENCE_TYPE.BIOLOGICAL_EVIDENCE,
  R1: EVIDENCE_TYPE.STANDARD_CARE,
  R2: EVIDENCE_TYPE.CLINICAL_EVIDENCE
};
export const LEVELS = ['1', '2', '3', '4', 'R1', 'R2'];
export const LEVEL_OF_EVIDENCE = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_R1', 'LEVEL_R2'];
export const ONCOGENICITY_CLASS_NAMES: { [oncogenic: string]: string } = {
  [ONCOGENICITY.NEUTRAL]: 'neutral',
  [ONCOGENICITY.LIKELY_NEUTRAL]: 'neutral',
  [ONCOGENICITY.UNKNOWN]: 'unknown',
  [ONCOGENICITY.INCONCLUSIVE]: 'inconclusive',
  [ONCOGENICITY.PREDICTED_ONCOGENIC]: 'oncogenic',
  [ONCOGENICITY.LIKELY_ONCOGENIC]: 'oncogenic',
  [ONCOGENICITY.ONCOGENIC]: 'oncogenic'
};

export enum EVIDENCE_TYPES {
  GENE_SUMMARY = 'GENE_SUMMARY',
  GENE_BACKGROUND = 'GENE_BACKGROUND',
  MUTATION_EFFECT = 'MUTATION_EFFECT',
  TUMOR_TYPE_SUMMARY = 'TUMOR_TYPE_SUMMARY',
  GENE_TUMOR_TYPE_SUMMARY = 'GENE_TUMOR_TYPE_SUMMARY',
  PROGNOSTIC_SUMMARY = 'PROGNOSTIC_SUMMARY',
  DIAGNOSTIC_SUMMARY = 'DIAGNOSTIC_SUMMARY',
  ONCOGENIC = 'ONCOGENIC',
  VUS = 'VUS',
  PROGNOSTIC_IMPLICATION = 'PROGNOSTIC_IMPLICATION',
  DIAGNOSTIC_IMPLICATION = 'DIAGNOSTIC_IMPLICATION',
  STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY = 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY',
  STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE = 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE',
  INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY = 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY',
  INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE = 'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE'
}

export const TREATMENT_EVIDENCE_TYPES = [
  EVIDENCE_TYPES.STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY,
  EVIDENCE_TYPES.STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE,
  EVIDENCE_TYPES.INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY,
  EVIDENCE_TYPES.INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE
];

// Defaults for margin spaces between sections
export const DEFAULT_MARGIN_TOP_SM = 'mt-2';
export const DEFAULT_MARGIN_TOP_LG = 'mt-3';
export const DEFAULT_MARGIN_BOTTOM_SM = 'mb-2';
export const DEFAULT_MARGIN_BOTTOM_LG = 'mb-3';
export const THRESHOLD_TABLE_FIXED_HEIGHT = 10;
export const THRESHOLD_ALTERATION_PAGE_TABLE_FIXED_HEIGHT = 5;
export const LG_TABLE_FIXED_HEIGHT = 500;
export const SM_TABLE_FIXED_HEIGHT = 300;

// Defaults for the models
export const DEFAULT_ONCOKB_INFO: OncoKBInfo = {
  dataVersion: {
    date: '',
    version: ''
  },
  levels: [],
  ncitVersion: '',
  oncoTreeVersion: ''
};

export const DEFAULT_MAIN_NUMBERS: MainNumber = {
  gene: 0,
  alteration: 0,
  tumorType: 0,
  drug: 0,
  level: []
};

export const DEFAULT_GENE: Gene = {
  curatedIsoform: '',
  curatedRefSeq: '',
  entrezGeneId: -1,
  geneAliases: [],
  genesets: [],
  hugoSymbol: '',
  name: '',
  oncogene: false,
  tsg: false
};

export const DEFAULT_MUTATION_EFFECT = {
  citations: {
    abstracts: [],
    pmids: []
  },

  description: '',

  knownEffect: ''
};

export const DEFAULT_QUERY = {
  alteration: '',
  alterationType: '',
  consequence: '',
  entrezGeneId: -1,
  hgvs: '',
  hugoSymbol: '',
  id: '',
  proteinEnd: -1,
  proteinStart: -1,
  svType: 'UNKNOWN' as 'UNKNOWN',
  tumorType: '',
  type: ''
};

export const DEFAULT_ANNOTATION: VariantAnnotation = {
  alleleExist: false,
  background: '',
  dataVersion: '',
  diagnosticImplications: [],
  diagnosticSummary: '',
  geneExist: false,
  geneSummary: '',
  highestDiagnosticImplicationLevel: 'NO',
  highestPrognosticImplicationLevel: 'NO',
  highestResistanceLevel: 'NO',
  highestSensitiveLevel: 'NO',
  hotspot: false,
  lastUpdate: '',
  mutationEffect: DEFAULT_MUTATION_EFFECT,
  oncogenic: '',
  otherSignificantResistanceLevels: [],
  otherSignificantSensitiveLevels: [],
  prognosticImplications: [],
  prognosticSummary: '',
  query: DEFAULT_QUERY,
  treatments: [],
  tumorTypeSummary: '',
  tumorTypes: [],

  variantExist: false,

  variantSummary: '',

  vus: false
};

export enum PAGE_ROUTE {
  LOGIN = '/login',
  LOGOUT = '/logout',
  DATA_ACCESS = '/dataAccess',
  CANCER_GENES = '/cancerGenes',
  ACTIONABLE_GENE = '/actionableGenes',
  GENE = '/gene',
  HOME = '/',
  ABOUT = '/about',
  TERMS = '/terms',
  TEAM = '/team',
  NEWS = '/news',
  LEVELS = '/levels',
  ACCOUNT = '/account',
  REGISTER = '/account/register',
  ACCOUNT_ACTIVATE = '/account/activate',
  ACCOUNT_SETTINGS = '/account/settings',
  ACCOUNT_PASSWORD_RESET = '/account/reset'
}

export enum TABLE_COLUMN_KEY {
  HUGO_SYMBOL = 'HUGO_SYMBOL',
  ALTERATION = 'ALTERATION',
  ALTERATIONS = 'ALTERATIONS',
  TUMOR_TYPE = 'TUMOR_TYPE',
  EVIDENCE_CANCER_TYPE = 'EVIDENCE_CANCER_TYPE',
  DRUGS = 'DRUGS',
  LEVEL = 'LEVEL',
  CITATIONS = 'CITATIONS',
  ONCOGENICITY = 'ONCOGENICITY',
  MUTATION_EFFECT = 'MUTATION_EFFECT'
}

export enum LicenseType {
  ACADEMIC = 'ACADEMIC',
  COMMERCIAL_RESEARCH = 'COMMERCIAL_RESEARCH',
  HOSPITAL = 'HOSPITAL',
  COMMERCIAL = 'COMMERCIAL'
}

export type License = {
  key: LicenseType;
  title: string;
};

export const LICENSE_TYPES: License[] = [
  {
    key: LicenseType.ACADEMIC,
    title: 'Research use in an academic setting'
  },
  {
    key: LicenseType.COMMERCIAL_RESEARCH,
    title: 'Research use in a commercial setting'
  },
  {
    key: LicenseType.HOSPITAL,
    title: 'Annotation of patient reports in a hospital'
  },
  {
    key: LicenseType.COMMERCIAL,
    title: 'Use in a commercial product'
  }
];

export enum ACCOUNT_TITLES {
  USER_NAME = 'Username',
  FIRST_NAME = 'First Name',
  LAST_NAME = 'Last Name',
  NAME = 'Name',
  EMAIL = 'Email',
  POSITION = 'Position',
  COMPANY = 'Company',
  CITY = 'City',
  COUNTRY = 'Country',
  API_TOKEN = 'API Token',
  LICENSE_TYPE = 'License'
}
