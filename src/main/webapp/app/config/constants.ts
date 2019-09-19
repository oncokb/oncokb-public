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

export const GRID_BREAKPOINTS = {
  LG: 980,
  XL: 1450
};

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
