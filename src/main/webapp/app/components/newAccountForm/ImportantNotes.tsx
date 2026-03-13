import React from 'react';
import styles from './ImportantNotes.module.scss';
import classnames from 'classnames';
import warning from 'content/images/warning.svg';
import OptimizedImage from 'app/shared/image/OptimizedImage';

export default function ImportantNotes() {
  return (
    <section id="important-notes" className={classnames(styles.container)}>
      <h2>
        Important
        <OptimizedImage alt="warning" src={warning} />
      </h2>
      <ul>
        <li>
          The more detail you can provide in your use case, the faster we can
          review and approve your request for registration. We will request
          clarifications to unclear use cases, which will delay your
          registration by 3-7 days.
        </li>
        <li>
          If you are doing any{' '}
          <span className={styles.aiMlEmphasis}>research that uses AI/ML</span>,
          please detail where and how OncoKB will be used in the workflow (use
          of OncoKB in AI/ML is extremely restricted, so the more detail you can
          provide, the better)
        </li>
      </ul>
    </section>
  );
}
