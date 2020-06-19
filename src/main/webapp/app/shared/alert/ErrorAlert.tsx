import { Alert } from 'react-bootstrap';
import React from 'react';
import { getErrorMessage, OncoKBError } from 'app/shared/alert/ErrorAlertUtils';

export const ErrorAlert: React.FunctionComponent<{
  error: OncoKBError;
}> = props => {
  return (
    <Alert variant="danger">
      <strong>{getErrorMessage(props.error)}</strong>
    </Alert>
  );
};
