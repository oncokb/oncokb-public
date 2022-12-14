import React from 'react';
import styles from './DividerWithInfo.module.scss';

export const DividerWithInfo: React.FunctionComponent<{}> = props => {
  return (
    <div className={styles.container}>
      <div className={styles.border} />
      <span className={styles.content}>{props.children}</span>
      <div className={styles.border} />
    </div>
  );
};
