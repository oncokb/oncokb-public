import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

export const QuickToolButton: React.FunctionComponent<ButtonProps> = (
  props: ButtonProps
) => {
  return (
    <Button variant="outline-primary" className={'m-2'} {...props}>
      {props.children}
    </Button>
  );
};
