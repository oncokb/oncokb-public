import React from 'react';
import { Alert } from 'react-bootstrap';
import { InvalidAnnotation } from 'app/store/AnnotationResult';

type InvalidAnnotationAlertProps = {
  invalidAnnotation: InvalidAnnotation;
};

export const InvalidAnnotationAlert: React.FunctionComponent<InvalidAnnotationAlertProps> = props => {
  return (
    <Alert variant="warning" className={'text-center'}>
      {props.invalidAnnotation.message}
    </Alert>
  );
};
