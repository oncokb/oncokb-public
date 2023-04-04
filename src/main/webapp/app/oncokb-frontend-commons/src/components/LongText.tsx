import * as React from 'react';
import { useState } from 'react';
import SummaryWithRefs from './SummaryWithRefs';
import styles from '../../../index.module.scss';
import classnames from 'classnames';
import showHideText from 'app/shared/texts/ShowHideText';

const shortenTextByCharacters = (text: string, cutoff: number) => {
  const shortText = (text || '').trim();
  if (shortText.length <= cutoff) {
    return shortText;
  } else {
    const separator = ' ';
    const words = (text || '').slice(0, cutoff).split(separator);
    words.pop();
    return words.join(separator);
  }
};

export const LongText: React.FunctionComponent<{
  text: string;
  cutoff?: number;
}> = props => {
  const propText = (props.text || '').trim();
  const cutoff = props.cutoff || 200;
  const [expandedText, setExpandedText] = useState(false);
  const text = expandedText
    ? propText
    : shortenTextByCharacters(propText, cutoff);
  return (
    <div>
      <SummaryWithRefs content={text} type={'linkout'} />
      {expandedText || text.length === propText.length ? undefined : (
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
      {!expandedText ? undefined : (
        <>
          <span
            className={classnames(styles.linkOutText, 'mx-2')}
            onClick={() => setExpandedText(false)}
          >
            Show less
          </span>
        </>
      )}
    </div>
  );
};
