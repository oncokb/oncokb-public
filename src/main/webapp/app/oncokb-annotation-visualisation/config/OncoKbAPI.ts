export type ArticleAbstract = {
  abstract: string;

  link: string;
};

export type Citations = {
  abstracts: Array<ArticleAbstract>;

  pmids: Array<string>;
};

export type InfoLevel = {
  colorHex: string;

  description: string;

  htmlDescription: string;

  levelOfEvidence:
    | 'LEVEL_1'
    | 'LEVEL_2'
    | 'LEVEL_3A'
    | 'LEVEL_3B'
    | 'LEVEL_4'
    | 'LEVEL_R1'
    | 'LEVEL_R2'
    | 'LEVEL_Px1'
    | 'LEVEL_Px2'
    | 'LEVEL_Px3'
    | 'LEVEL_Dx1'
    | 'LEVEL_Dx2'
    | 'LEVEL_Dx3'
    | 'LEVEL_Fda1'
    | 'LEVEL_Fda2'
    | 'LEVEL_Fda3'
    | 'NO';
};

export type Gene = {
  entrezGeneId: number;

  geneAliases: Array<string>;

  genesets: Array<Geneset>;

  grch37Isoform: string;

  grch37RefSeq: string;

  grch38Isoform: string;

  grch38RefSeq: string;

  hugoSymbol: string;

  oncogene: boolean;

  tsg: boolean;
};

export type Geneset = {
  genes: Array<Gene>;

  id: number;

  name: string;

  uuid: string;
};

export type VariantConsequence = {
  description: string;

  isGenerallyTruncating: boolean;

  term: string;
};

export type Alteration = {
  alteration: string;

  consequence: VariantConsequence;

  gene: Gene;

  name: string;

  proteinEnd: number;

  proteinStart: number;

  refResidues: string;

  referenceGenomes: Array<'GRCh37' | 'GRCh38'>;

  variantResidues: string;
};
