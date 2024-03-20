import React from 'react';
import { getShortenPmidsFromList } from 'app/shared/utils/Utils';

export const PMIDLink: React.FunctionComponent<{
  pmids: string;
  wrapText?: boolean;
}> = props => {
  return (
    <span>
      PMID:{' '}
      <a
        href={`https://pubmed.ncbi.nlm.nih.gov/?term=${props.pmids
          .split(/[ |,]/g)
          .join(' ')}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ whiteSpace: props.wrapText ? 'normal' : 'nowrap' }}
      >
        {props.pmids}
      </a>
    </span>
  );
};

export const PMIDShortLink: React.FunctionComponent<{
  pmids: string;
}> = props => {
  const pmidList = props.pmids
    .split(/,|\s/)
    .filter(pmid => pmid)
    .map(pmid => pmid.trim());
  return <span>PMID(s): {getShortenPmidsFromList(pmidList)}</span>;
};
