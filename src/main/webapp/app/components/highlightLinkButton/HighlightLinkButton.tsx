import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './HighlightLinkButton.module.scss';

export const HighlightLinkButton: React.FunctionComponent<{}> = props => {
  return (
    <Button variant="link" className={styles.highlight}>
      {props.children}
    </Button>
  );
};
