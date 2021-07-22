import { Moment } from 'moment';
import { IUser } from 'app/shared/model/user.model';

export interface IToken {
  id?: number;
  token?: string;
  creation?: string;
  expiration?: string;
  usageLimit?: number;
  currentUsage?: number;
  renewable?: boolean;
  numAccessIps?: number;
  user?: IUser;
}

export const defaultValue: Readonly<IToken> = {
  renewable: false,
};
