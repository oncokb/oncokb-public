import { Moment } from 'moment';
import { IUser } from 'app-backup/shared/model/user.model';

export interface IToken {
  id?: number;
  token?: string;
  creation?: Moment;
  expiration?: Moment;
  user?: IUser;
}

export const defaultValue: Readonly<IToken> = {};
