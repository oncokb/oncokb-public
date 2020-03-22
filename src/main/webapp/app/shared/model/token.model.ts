import { Moment } from 'moment';
import { IUser } from 'app/shared/model/user.model';

export interface IToken {
  id?: number;
  token?: string;
  creation?: Moment;
  expiration?: Moment;
  usageLimit?: number;
  currentUsage?: number;
  user?: IUser;
}

export const defaultValue: Readonly<IToken> = {};
