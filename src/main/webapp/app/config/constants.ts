import { OncoKBInfo, Gene } from 'app/shared/api/generated/OncoKbAPI';
import { MainNumber } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';

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
  MUTATION_EFFECT = 'MUTATION_EFFECT'
}

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

export enum PAGE_ROUTE {
  LOGIN = '/login',
  LOGOUT = '/logout',
  REGISTER = '/register',
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
  ACCOUNT = '/account'
}

export enum TABLE_COLUMN_KEY {
  HUGO_SYMBOL = 'HUGO_SYMBOL',
  ALTERATION = 'ALTERATION',
  TUMOR_TYPE = 'TUMOR_TYPE',
  DRUGS = 'DRUGS',
  LEVEL = 'LEVEL',
  CITATIONS = 'CITATIONS',
  ONCOGENICITY = 'ONCOGENICITY'
}
