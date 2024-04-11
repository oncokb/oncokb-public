import * as XRegExp from 'xregexp';
import _ from 'lodash';
import client from '../api/clientInstance';
import { VerifyCompanyNameVM } from '../api/generated/API';
import { notifyError } from './NotificationUtils';
import pluralize from 'pluralize';

export const XREGEXP_VALID_LATIN_TEXT = '^[\\p{Latin}\\p{Common}\\s]+$';

const LATIN_TEXT_PATTER = {
  value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
  errorMessage: 'Sorry, we only support Latin letters for now.',
};

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

export const textValidation = (minLength?: number, maxLength?: number) => {
  const validation = {
    pattern: LATIN_TEXT_PATTER,
  } as any;
  if (minLength) {
    validation.minLength = {
      value: minLength,
      errorMessage: `Required to be at least ${pluralize(
        'character',
        minLength,
        true
      )}`,
    };
  }
  if (maxLength) {
    validation.maxLength = {
      value: maxLength,
      errorMessage: `Cannot be longer than ${pluralize(
        'character',
        maxLength,
        true
      )}`,
    };
  }
  return validation;
};

export const OPTIONAL_TEXT_VAL = textValidation(0, 255);

export const TEXT_VAL = textValidation(2, 255);

export const SHORT_TEXT_VAL = textValidation(2, 50);

export const LONG_TEXT_VAL = textValidation(2);

export const EMAIL_VAL = {
  required: {
    value: true,
    errorMessage: 'Your email is required.',
  },
  minLength: {
    value: 5,
    errorMessage: 'Your email is required to be at least 5 characters.',
  },
  maxLength: {
    value: 50,
    errorMessage: 'Your email cannot be longer than 50 characters.',
  },
};

export const fieldRequiredValidation = (fieldName: string) => {
  return {
    required: {
      value: true,
      errorMessage: `The ${fieldName} is required.`,
    },
  };
};
