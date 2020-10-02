import { Button, ButtonProps } from 'react-bootstrap';
import LoadingIndicator from '../../components/loadingIndicator/LoadingIndicator';
import React from 'react';

export const LoadingButton: React.FunctionComponent<
  { loading: boolean } & ButtonProps & React.HTMLAttributes<HTMLButtonElement>
> = props => {
  const { loading, ...rest } = props;
  return (
    <Button {...rest}>
      {loading ? (
        <LoadingIndicator isLoading={true} size={'small'} color="white" />
      ) : (
        props.children
      )}
    </Button>
  );
};
