import * as React from 'react';
import { useState } from 'react';
import SummaryWithRefs from './SummaryWithRefs';

const shortenTextByWords = (text: string, numOfWords: number) => {
  const separator = ' ';
  return text.split(separator).slice(0, numOfWords).join(separator);
};

export const LongText: React.FunctionComponent<{
  text: string;
  numOfWords?: number;
}> = props => {
  const numOfWords = props.numOfWords || 20;
  const [expandedText, setExpandedText] = useState(false);
  const text = expandedText
    ? props.text
    : shortenTextByWords(props.text, numOfWords);
  return (
    <div>
      <SummaryWithRefs content={text} type={'linkout'} />
      {expandedText || text.length === props.text.length ? undefined : (
        <>
          <span className={'mx-2'}>...</span>
          <span
            className={'text-primary'}
            style={{ cursor: 'pointer' }}
            onClick={() => setExpandedText(true)}
          >
            Show more
          </span>
        </>
      )}
    </div>
  );
};
