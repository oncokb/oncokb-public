import { REF_CAPTURE, VALID_LATIN_TEXT } from 'app/config/constants/regex';

describe('Regex constants test', () => {
  describe('Reference capture regex', () => {
    it('Regex should capture PMID', () => {
      expect(REF_CAPTURE.test('test')).toBeFalsy();
      expect(REF_CAPTURE.test('test (PMID123)')).toBeTruthy();
      expect(REF_CAPTURE.test('test (PMID:123)')).toBeTruthy();
      expect(REF_CAPTURE.test('test (PMID:123,123)')).toBeTruthy();
      expect(REF_CAPTURE.test('test ( PMID:123)')).toBeTruthy();
      expect(REF_CAPTURE.test('test ( PMID:123 )')).toBeTruthy();
      expect(REF_CAPTURE.test('test (PMID:123 )')).toBeTruthy();
      expect(REF_CAPTURE.test('test (PMID:123 ')).toBeFalsy();
      expect(REF_CAPTURE.test('test ( test PMID:123 )')).toBeFalsy();
    });
    it('Regex should capture NCT', () => {
      const nctContent = 'NCT03088176';
      expect(REF_CAPTURE.test('test')).toBeFalsy();
      expect(REF_CAPTURE.test(`test (${nctContent})`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test (${nctContent} )`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test ( ${nctContent})`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test ( ${nctContent} )`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test ( ${nctContent}`)).toBeFalsy();
    });
    it('Regex should capture Abstract', () => {
      const abstractContent =
        'Abstract: Zeng et al. Abstract #0177, IDDF 2020. https://gut.bmj.com/content/69/Suppl_2/A22.1';
      expect(REF_CAPTURE.test('test')).toBeFalsy();
      expect(REF_CAPTURE.test(`test (${abstractContent})`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test (${abstractContent} )`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test ( ${abstractContent})`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test ( ${abstractContent} )`)).toBeTruthy();
      expect(REF_CAPTURE.test(`test ( ${abstractContent}`)).toBeFalsy();
    });

    it('should handle abstracts with one level of nested parenthesis in url', () => {
      expect(
        REF_CAPTURE.test(
          '(Abstract: Solomon, BJ. Abstract #1372P, Annals of Oncology Vol 34, Suppl 2. https://www.annalsofoncology.org/article/S0923-7534(23)03242-8/fulltext)'
        )
      ).toEqual(true);
    });

    it('Regex should capture expected matches', () => {
      const mixText =
        'A statistically (significant) hotspot (PMID: 23525077). To wildtype (Abstract: Zeng et al. Abstract #0177, IDDF 2020.). Preclinical st(udie)s suggest.';
      expect(mixText.split(REF_CAPTURE).length).toEqual(5);
    });
  });

  describe('Valid latin text regex', () => {
    expect(VALID_LATIN_TEXT.test('test')).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('TEST')).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('Test')).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('Test Test')).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('Test à')).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('Test Ö')).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('Test ö')).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('Test ÿ')).toBeTruthy();
    expect(
      VALID_LATIN_TEXT.test("Test !@#$%^&*()_+[]{}|;:',.<>?")
    ).toBeTruthy();
    expect(VALID_LATIN_TEXT.test('1234567890')).toBeTruthy();

    expect(VALID_LATIN_TEXT.test('Привет')).toBeFalsy();
    expect(VALID_LATIN_TEXT.test('Γειά')).toBeFalsy();
    expect(VALID_LATIN_TEXT.test('你好')).toBeFalsy();
    expect(VALID_LATIN_TEXT.test('Hello 😊')).toBeFalsy();
    expect(VALID_LATIN_TEXT.test('Hello Привет')).toBeFalsy();
  });
});
