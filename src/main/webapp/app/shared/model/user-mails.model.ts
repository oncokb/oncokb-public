import { Moment } from 'moment';
import { MailType } from 'app/shared/model/enumerations/mail-type.model';

export interface IUserMails {
  id?: number;
  sentDate?: string;
  sentBy?: string;
  mailType?: MailType;
  sentFrom?: string;
  userLogin?: string;
  userId?: number;
}

export const defaultValue: Readonly<IUserMails> = {};
