import { parseCookieNumber } from './RegistrationHover';

describe('parseCookieNumber', () => {
  it('returns parsed number for valid cookie value', () => {
    expect(
      parseCookieNumber(
        'a=1; registration_hover_count=12; b=2',
        'registration_hover_count'
      )
    ).toBe(12);
  });

  it('returns 0 when cookie is missing', () => {
    expect(parseCookieNumber('a=1; b=2', 'registration_hover_count')).toBe(0);
  });

  it('returns 0 for malformed cookie tokens', () => {
    expect(
      parseCookieNumber('registration_hover_count', 'registration_hover_count')
    ).toBe(0);
    expect(
      parseCookieNumber('registration_hover_count=', 'registration_hover_count')
    ).toBe(0);
  });

  it('returns 0 for non-numeric or negative values', () => {
    expect(
      parseCookieNumber(
        'registration_hover_count=abc',
        'registration_hover_count'
      )
    ).toBe(0);
    expect(
      parseCookieNumber(
        'registration_hover_count=-3',
        'registration_hover_count'
      )
    ).toBe(0);
  });

  it('returns 0 when cookie value has invalid URI encoding', () => {
    expect(
      parseCookieNumber(
        'registration_hover_count=%E0%A4%A',
        'registration_hover_count'
      )
    ).toBe(0);
  });
});
