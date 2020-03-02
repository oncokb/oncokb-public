import { Alert } from 'react-bootstrap';
import React from 'react';

type OncoKBErrorResponseBody = {
  type: string;
  title: string;
  status: number;
  detail: string;
  path: string;
  message: string;
};
type OncoKBResponse = Response & {
  body: OncoKBErrorResponseBody;
};
export type OncoKBError = Error & {
  response: OncoKBResponse;
};

export const ErrorAlert: React.FunctionComponent<{
  error: OncoKBError;
}> = props => {
  const error = props.error;
  return (
    <Alert variant="danger">
      {error.response && error.response.body && error.response.body.detail ? (
        <strong>{error.response.body.detail}</strong>
      ) : (
        <strong>{error.message}</strong>
      )}
    </Alert>
  );
};
