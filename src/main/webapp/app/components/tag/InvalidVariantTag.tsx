import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import styles from './tag.module.scss';

const InvalidVariantTag: FunctionComponent<{
  className?: string;
}> = props => {
  return (
    <span className={classnames(props.className, styles.invalidTag)}>
      <i className="fa fa-exclamation-triangle" aria-hidden="true" />
      Invalid
    </span>
  );
};

export default InvalidVariantTag;
