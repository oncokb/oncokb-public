import { REFERENCE_GENOME } from 'app/config/constants';
import { getReferenceGenomeFromSearch } from 'app/shared/utils/UrlUtils';

describe('getReferenceGenomeFromSearch', () => {
  it('parses canonical key and value', () => {
    expect(getReferenceGenomeFromSearch('?refGenome=GRCh38')).toBe(
      REFERENCE_GENOME.GRCh38
    );
  });

  it('parses lowercase key', () => {
    expect(getReferenceGenomeFromSearch('?refgenome=GRCh37')).toBe(
      REFERENCE_GENOME.GRCh37
    );
  });

  it('parses lowercase value', () => {
    expect(getReferenceGenomeFromSearch('?refGenome=grch38')).toBe(
      REFERENCE_GENOME.GRCh38
    );
  });

  it('parses mixed-case key', () => {
    expect(getReferenceGenomeFromSearch('?RefGenome=grch37')).toBe(
      REFERENCE_GENOME.GRCh37
    );
  });

  it('parses search string without leading question mark', () => {
    expect(getReferenceGenomeFromSearch('refgenome=grch38')).toBe(
      REFERENCE_GENOME.GRCh38
    );
  });

  it('parses hash-style query string', () => {
    expect(getReferenceGenomeFromSearch('#refgenome=grch38')).toBe(
      REFERENCE_GENOME.GRCh38
    );
  });

  it('returns undefined for invalid values', () => {
    expect(getReferenceGenomeFromSearch('?refGenome=abc')).toBeUndefined();
  });

  it('returns undefined when key is absent', () => {
    expect(getReferenceGenomeFromSearch('?tumorType=Lung')).toBeUndefined();
  });
});
