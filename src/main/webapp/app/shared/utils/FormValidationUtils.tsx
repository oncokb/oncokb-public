import { XREGEXP_VALID_LATIN_TEXT } from 'app/config/constants';
import * as XRegExp from 'xregexp';
import _ from 'lodash';
import client from '../api/clientInstance';
import { VerifyCompanyNameVM } from '../api/generated/API';
import { notifyError } from './NotificationUtils';

/**
 * Check whether the company name is already in use every 500ms.
 */
export const debouncedCompanyNameValidator = _.debounce(
  (
    value: string,
    ctx: any,
    input: any,
    cb: (isValid: boolean | string) => void,
    companyId?: number
  ) => {
    // Don't run the validator if empty string or not latin chars
    if (value.trim() === '' || !XRegExp(XREGEXP_VALID_LATIN_TEXT).test(value)) {
      cb(false);
      return;
    }
    const info = { name: value.trim(), companyId } as Partial<
      VerifyCompanyNameVM
    >;
    client
      .verifyCompanyNameUsingPOST({
        verificationInfo: info as VerifyCompanyNameVM,
      })
      .then(isValid => {
        isValid ? cb(true) : cb('Company name in use!');
      })
      .catch((error: any) => {
        cb(false);
        notifyError(error, 'Error finding company with name');
      });
  },
  500
);

export const textValidation = (minLength: number, maxLength: number) => {
  return {
    pattern: {
      value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
      errorMessage: 'Sorry, we only support Latin letters for now.',
    },
    minLength: {
      value: minLength,
      errorMessage: `Required to be at least ${minLength} character${
        minLength > 1 ? 's' : ''
      }`,
    },
    maxLength: {
      value: maxLength,
      errorMessage: `Cannot be longer than ${maxLength} characters`,
    },
  };
};

export const fieldRequiredValidation = (fieldName: string) => {
  return {
    required: {
      value: true,
      errorMessage: `The ${fieldName} is required.`,
    },
  };
};
