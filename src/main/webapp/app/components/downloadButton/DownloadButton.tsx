import { Button, ButtonProps } from 'react-bootstrap';
import React from 'react';
import styles from './DownloadButton.module.scss';

interface ILinkButton extends ButtonProps {
  className?: string;
}

// Naturally the Button component has href property which will convert the component to a A tag
// But in the scenario downloading PDF file, we need to specify the download property
export const DownloadButton: React.FunctionComponent<ILinkButton> = props => {
  const { href, ...rest } = props;
  return (
    <Button {...rest}>
      <a href={href} download className={styles.aTag}>
        {props.children}
      </a>
    </Button>
  );
};
