import { EMAIL_VAL } from './FormValidationUtils';

describe('FormValidationUtils', () => {
  it('allows email addresses up to 254 characters', () => {
    expect(EMAIL_VAL.maxLength.value).toBe(254);
    expect(EMAIL_VAL.maxLength.errorMessage).toBe(
      'Your email cannot be longer than 254 characters.'
    );
  });
});
