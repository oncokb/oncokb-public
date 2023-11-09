import { REF_CAPTURE } from 'app/config/constants/regex';

describe('Regex constants test', () => {
  describe('Reference capture regex', () => {
    it('Regex should capture PMID', () => {
      expect(REF_CAPTURE.test('test')).toBeFalsy();
      expect(REF_CAPTURE.test('test (PMID:123)')).toBeTruthy();
      expect(REF_CAPTURE.test('test (PMID:123,123)')).toBeTruthy();
      expect(REF_CAPTURE.test('test ( PMID:123)')).toBeTruthy();
      expect(REF_CAPTURE.test('test ( PMID:123 )')).toBeTruthy();
      expect(REF_CAPTURE.test('test (PMID:123 )')).toBeTruthy();
      expect(REF_CAPTURE.test('test (PMID:123 ')).toBeFalsy();
      expect(REF_CAPTURE.test('test ( test PMID:123 )')).toBeFalsy();
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
    it('Regex should capture expected matches', () => {
      const mixText =
        'A statistically (significant) hotspot (PMID: 23525077). To wildtype (Abstract: Zeng et al. Abstract #0177, IDDF 2020.). Preclinical st(udie)s suggest.';
      expect(mixText.split(REF_CAPTURE).length).toEqual(5);
    });
  });
});
