import React from 'react';
import styles from './HighlightLinkButton.module.scss';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

export const HighlightLinkButton: React.FunctionComponent<{
  href?: string;
}> = props => {
  const component = !props.href ? (
    <span className={classnames('btn', styles.highlight, styles.withoutHref)}>
      {props.children}
    </span>
  ) : (
    <span className={classnames('btn', styles.highlight, styles.withHref)}>
      <Link to={props.href}>{props.children}</Link>
    </span>
  );
  return component;
};
