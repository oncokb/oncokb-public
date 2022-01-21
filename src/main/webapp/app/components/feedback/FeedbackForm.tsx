import React from 'react';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { Row, Col, Button } from 'react-bootstrap';
import {
  Annotation,
  Feedback,
  FeedbackType,
} from 'app/components/feedback/types';
import { EMAIL_VAL, TEXT_VAL } from 'app/shared/utils/FormValidationUtils';

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
    annotation.cancerType,
  ].filter(item => !!item);
  return content.join(' / ');
}

export const FeedbackForm: React.FunctionComponent<FeedbackFormProps> = props => {
  const defaultModel = {
    gene: props.annotation ? props.annotation.gene : '',
    alteration: props.annotation ? props.annotation.alteration : '',
    cancerType: props.annotation ? props.annotation.cancerType : '',
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
            <>
              <AvField
                name="gene"
                label={'Gene'}
                type="input"
                validate={{
                  required: {
                    value: true,
                    errorMessage: 'Required',
                  },
                }}
              />
              <AvField name="alteration" label={'Alteration'} type="input" />
              <AvField name="cancerType" label={'Cancer Type'} type="input" />
            </>
          ) : null}
          <AvField
            name="description"
            label={
              props.type === FeedbackType.ANNOTATION
                ? 'Justification (including references)'
                : 'Description'
            }
            type="textarea"
            validate={{
              required: {
                value: true,
                errorMessage: 'Required',
              },
            }}
          />
          <AvField
            name="email"
            label={'Email'}
            type="email"
            validate={EMAIL_VAL}
          />
          <AvField
            name="name"
            label={'Name'}
            type="input"
            validate={{
              required: {
                value: true,
                errorMessage: 'Your name is required.',
              },
              ...TEXT_VAL,
            }}
          />
          <div>
            Please try to provide your information so we can get back to you
            when the suggestion is incorporated.
          </div>
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
