import React from 'react';

export const PMIDLink: React.FunctionComponent<{ pmids: string }> = props => {
  return (
    <span>
      PMID:{' '}
      <a
        href={`https://www.ncbi.nlm.nih.gov/pubmed/${props.pmids}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ whiteSpace: 'nowrap' }}
      >
        {props.pmids}
      </a>
    </span>
  );
};
