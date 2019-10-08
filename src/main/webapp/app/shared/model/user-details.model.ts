import { AccountType } from 'app/shared/model/enumerations/account-type.model';

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
