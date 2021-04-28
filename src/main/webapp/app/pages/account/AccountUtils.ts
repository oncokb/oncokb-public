import {
  ACCOUNT_TITLES,
  License,
  LICENSE_TYPES,
  LicenseType,
} from 'app/config/constants';

export function getSectionClassName(theFirst = false) {
  return `justify-content-center ${theFirst ? 'pb-3' : 'border-top py-3'}`;
}

export function getAccountInfoTitle(
  key: ACCOUNT_TITLES,
  license: LicenseType | undefined
) {
  if (key === ACCOUNT_TITLES.EMAIL) {
    let prefix: string;
    switch (license) {
      case LicenseType.ACADEMIC:
        prefix = 'Institution';
        break;
      case LicenseType.COMMERCIAL:
      case LicenseType.RESEARCH_IN_COMMERCIAL:
        prefix = 'Company';
        break;
      case LicenseType.HOSPITAL:
        prefix = 'Hospital';
        break;
      default:
        prefix = '';
        break;
    }
    return `${prefix ? `${prefix} ` : ''}Email`;
  } else if (
    [ACCOUNT_TITLES.COMPANY_SECTION_TITLE, ACCOUNT_TITLES.COMPANY].includes(key)
  ) {
    let title: string;
    switch (license) {
      case LicenseType.ACADEMIC:
        title = 'Institution / University';
        break;
      case LicenseType.COMMERCIAL:
      case LicenseType.RESEARCH_IN_COMMERCIAL:
        title = 'Company';
        break;
      case LicenseType.HOSPITAL:
        title = 'Hospital';
        break;
      default:
        title = '';
        break;
    }

    if (key === ACCOUNT_TITLES.COMPANY_SECTION_TITLE) {
      title = `${title} Information`;
    }
    return title;
  } else {
    return key;
  }
}

export function getLicenseTitle(key: LicenseType): License | undefined {
  return LICENSE_TYPES.find(license => license.key === key);
}
