import React from 'react';
import { Linkout } from 'app/shared/links/Linkout';
import styles from './external-link-icon.module.scss';

const ExternalLinkIcon: React.FunctionComponent<{
  link: string;
  className?: string;
}> = props => {
  return (
    <Linkout link={props.link} className={styles.externalLinkContainer}>
      <span className={styles.externalLinkContent}>{props.children}</span>
      <i className={`fa fa-external-link ${props.className} ${styles.icon}`} />
    </Linkout>
  );
};
export default ExternalLinkIcon;
