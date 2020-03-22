import { LicenseType } from 'app/shared/model/enumerations/license-type.model';

export interface IUserDetails {
  id?: number;
  licenseType?: LicenseType;
  jobTitle?: string;
  company?: string;
  city?: string;
  country?: string;
  address?: string;
  userId?: number;
}

export const defaultValue: Readonly<IUserDetails> = {};
