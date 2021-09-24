import {
  ANNOTATION_PAGE_TAB_KEYS,
  LEVEL_TYPES,
  REFERENCE_GENOME,
} from 'app/config/constants';

type AnnotationPageSearchQueries = {
  refGenome?: REFERENCE_GENOME;
  tumorType?: string;
};
type AnnotationPageHashQueries = {
  tab?: ANNOTATION_PAGE_TAB_KEYS;
};

export type GenePageSearchQueries = AnnotationPageSearchQueries & {};
export type GenePageHashQueries = AnnotationPageHashQueries & {};

export type AlterationPageSearchQueries = AnnotationPageSearchQueries & {};
export type AlterationPageHashQueries = AnnotationPageHashQueries & {};

export type ActionableGenesPageHashQueries = {
  sections?: LEVEL_TYPES[];
  levels?: string[];
  hugoSymbol?: string;
  tumorType?: string;
  drug?: string;
  refGenome?: REFERENCE_GENOME;
};

export type AdminSendEmailPageSearchQueries = {
  to?: string;
};
