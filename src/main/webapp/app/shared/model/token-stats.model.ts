import { Moment } from 'moment';
import { IToken } from 'app/shared/model/token.model';

export interface ITokenStats {
  id?: number;
  accessIp?: string;
  resource?: string;
  accessTime?: Moment;
  token?: IToken;
}

export const defaultValue: Readonly<ITokenStats> = {};
