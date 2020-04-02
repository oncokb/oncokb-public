import { Alert } from 'react-bootstrap';
import React from 'react';
import { DEFAULT_MESSAGE_UNKNOWN_GENE } from 'app/config/constants';

export const UnknownGeneAlert: React.FunctionComponent = () => {
  return (
    <Alert variant="warning" className={'text-center'}>
      {DEFAULT_MESSAGE_UNKNOWN_GENE}
    </Alert>
  );
};
