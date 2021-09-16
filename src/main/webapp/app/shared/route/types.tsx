import {
  ANNOTATION_PAGE_TAB_KEYS,
  REFERENCE_GENOME,
} from 'app/config/constants';

type AnnotationPageSearchQueries = {
  refGenome?: REFERENCE_GENOME;
};
type AnnotationPageHashQueries = {
  tab?: ANNOTATION_PAGE_TAB_KEYS;
};

export type GenePageSearchQueries = AnnotationPageSearchQueries & {};
export type GenePageHashQueries = AnnotationPageHashQueries & {};

export type AlterationPageSearchQueries = AnnotationPageSearchQueries & {};
export type AlterationPageHashQueries = AnnotationPageHashQueries & {};
