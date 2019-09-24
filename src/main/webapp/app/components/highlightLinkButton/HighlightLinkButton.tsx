import React from 'react';
import styles from './HighlightLinkButton.module.scss';
import { Else, Then, If } from 'react-if';
import classnames from 'classnames';
import { Link } from 'react-router-dom';

export const HighlightLinkButton: React.FunctionComponent<{ href?: string }> = props => {
  return (
    <If condition={props.href === undefined}>
      <Then>
        <span className={classnames('btn', styles.highlight, styles.withoutHref)}>{props.children}</span>
      </Then>
      <Else>
        <span className={classnames('btn', styles.highlight, styles.withHref)}>
          <Link to={props.href!}>{props.children}</Link>
        </span>
      </Else>
    </If>
  );
};
