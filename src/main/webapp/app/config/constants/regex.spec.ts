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
    test.each([
      'test',
      'TEST',
      'Test',
      'Test Test',
      'Test à',
      'Test Ö',
      'Test ö',
      'Test ÿ',
      "Test !@#$%^&*()_+[]{}|;:',.<>?",
      '1234567890',
      'test\ntest',
      'test\rtest',
      'test\r\ntest',
    ])('Truthy text: %s', text => {
      expect(VALID_LATIN_TEXT.test(text)).toBeTruthy();
    });

    test.each(['Привет', 'Γειά', '你好', 'Hello 😊', 'Hello Привет'])(
      'Falsy text: %s',
      text => {
        expect(VALID_LATIN_TEXT.test(text)).toBeFalsy();
      }
    );
  });
});
