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
    return `${
      license === LicenseType.ACADEMIC ? 'Institution' : 'Company'
    } email`;
  } else if (key === ACCOUNT_TITLES.COMPANY) {
    return `${
      license === LicenseType.ACADEMIC ? 'Institution / University' : 'Company'
    }`;
  } else {
    return key;
  }
}

export function getLicenseTitle(key: LicenseType): License | undefined {
  return LICENSE_TYPES.find(license => license.key === key);
}
