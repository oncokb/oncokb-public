import * as React from 'react';
import { useState } from 'react';
import SummaryWithRefs from './SummaryWithRefs';
import styles from '../../../index.module.scss';

const shortenTextByWords = (text: string, cutoff: number) => {
  const separator = ' ';
  const words = text.slice(0, cutoff).split(separator);
  words.pop();
  return words.join(separator);
};

export const LongText: React.FunctionComponent<{
  text: string;
  cutoff?: number;
}> = props => {
  const cutoff = props.cutoff || 200;
  const [expandedText, setExpandedText] = useState(false);
  const text = expandedText
    ? props.text
    : shortenTextByWords(props.text, cutoff);
  return (
    <div>
      <SummaryWithRefs content={text} type={'linkout'} />
      {expandedText || text.length === props.text.length ? undefined : (
        <>
          <span className={'mx-2'}>...</span>
          <span
            className={styles.linkOutText}
            onClick={() => setExpandedText(true)}
          >
            Show more
          </span>
        </>
      )}
    </div>
  );
};
