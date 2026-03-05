import { parseCookieNumber } from './RegistrationNudge';

describe('RegistrationNudge cookie parsing', () => {
  it('returns parsed number for valid cookie value', () => {
    expect(
      parseCookieNumber('a=1; page_visit_count=8; b=2', 'page_visit_count')
    ).toBe(8);
  });

  it('returns 0 when cookie is missing', () => {
    expect(parseCookieNumber('a=1; b=2', 'page_visit_count')).toBe(0);
  });

  it('returns 0 for malformed cookie tokens', () => {
    expect(parseCookieNumber('page_visit_count', 'page_visit_count')).toBe(0);
    expect(parseCookieNumber('page_visit_count=', 'page_visit_count')).toBe(0);
  });

  it('returns 0 for non-numeric or negative values', () => {
    expect(parseCookieNumber('page_visit_count=abc', 'page_visit_count')).toBe(
      0
    );
    expect(parseCookieNumber('page_visit_count=-3', 'page_visit_count')).toBe(
      0
    );
  });

  it('returns 0 when cookie value has invalid URI encoding', () => {
    expect(
      parseCookieNumber('page_visit_count=%E0%A4%A', 'page_visit_count')
    ).toBe(0);
  });
});
