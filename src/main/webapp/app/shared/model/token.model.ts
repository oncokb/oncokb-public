import { Moment } from 'moment';
import { IUser } from 'app/shared/model/user.model';

export interface IToken {
  id?: number;
  token?: string;
  creation?: Moment;
  expiration?: Moment;
  user?: IUser;
}

export const defaultValue: Readonly<IToken> = {};
