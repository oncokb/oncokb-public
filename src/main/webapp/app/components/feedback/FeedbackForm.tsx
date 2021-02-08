import React from 'react';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { Row, Col, Button } from 'react-bootstrap';
import {
  Annotation,
  Feedback,
  FeedbackType,
} from 'app/components/feedback/types';

export type FeedbackFormProps = Feedback & {
  onSubmit: (value: Feedback) => void;
};

export function getAnnotationString(annotation?: Annotation) {
  if (annotation === undefined) {
    return '';
  } else if (typeof annotation === 'string') {
    return annotation;
  }
  const content = [
    annotation.gene,
    annotation.alteration,
    annotation.tumorType,
  ].filter(item => !!item);
  return content.join(' / ');
}

export const FeedbackForm: React.FunctionComponent<FeedbackFormProps> = props => {
  const defaultModel = {
    annotation: props.annotation ? getAnnotationString(props.annotation) : '',
    description: props.description,
    email: props.email,
    name: props.name,
  };

  function onSubmit(event: any, values: Feedback) {
    props.onSubmit(values);
  }

  return (
    <AvForm onValidSubmit={onSubmit} model={defaultModel}>
      <Row className={'mt-2'}>
        <Col>
          {props.annotation ? (
            <AvField
              name="annotation"
              label={'Annotation to be added'}
              type="input"
              validate={{
                required: {
                  value: true,
                  errorMessage:
                    'Please try to include gene/alteration/tumor type or any info you like us to include',
                },
              }}
            />
          ) : null}
          <AvField
            name="description"
            label={
              props.type === FeedbackType.ANNOTATION
                ? 'Reference (PMIDs, Abstracts, Links)'
                : 'Description'
            }
            type="textarea"
            validate={{
              required: {
                value: true,
                errorMessage:
                  props.type === FeedbackType.ANNOTATION
                    ? 'Any reference would help us to quickly add the annotation.'
                    : 'Please provide more information.',
              },
            }}
          />
          <AvField
            name="email"
            label={'Email'}
            type="email"
            validate={{
              required: {
                value: true,
                errorMessage: 'Your email is required.',
              },
            }}
          />
          <AvField
            name="name"
            label={'Name'}
            type="input"
            validate={{
              required: {
                value: false,
              },
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button id="submit-suggestion" variant="primary" type="submit">
            Submit
          </Button>
        </Col>
      </Row>
    </AvForm>
  );
};
