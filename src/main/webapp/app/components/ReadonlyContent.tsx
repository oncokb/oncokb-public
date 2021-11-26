import React from 'react';
import { Alert } from 'react-bootstrap';
import { AppConfig } from 'app/appConfig';

type ReadonlyContentProps = {
  messageTitle: string;
  messageDescription?: string;
};

export const ReadonlyContent: React.FunctionComponent<ReadonlyContentProps> = props => {
  return (
    <>
      {AppConfig.serverConfig.readonly ? (
        <Alert variant="danger">
          <h4>{props.messageTitle}</h4>
          <div>{props.messageDescription}</div>
          <div>Sorry for the inconvenience.</div>
        </Alert>
      ) : (
        <>{props.children}</>
      )}
    </>
  );
};
