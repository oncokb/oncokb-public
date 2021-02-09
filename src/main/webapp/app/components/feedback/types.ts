type FormattedAnnotation = {
  gene: string;
  alteration?: string;
  cancerType?: string;
};
export type Annotation = FormattedAnnotation;

export type FeedbackContent = {
  annotation?: Annotation;
  description?: string;
  email?: string;
  name?: string;
};
export type Feedback = FeedbackContent & {
  type: FeedbackType;
};

export enum FeedbackType {
  GENERAL,
  ANNOTATION,
}
