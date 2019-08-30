export const enum AccountType {
  ACADEMIC = 'ACADEMIC',
  COMMERCIAL = 'COMMERCIAL',
  NONAFFILIATED = 'NONAFFILIATED'
}

export interface IUserDetails {
  id?: number;
  accountType?: AccountType;
  jobTitle?: string;
  company?: string;
  city?: string;
  country?: string;
  address?: string;
  userId?: number;
}

export const defaultValue: Readonly<IUserDetails> = {};
