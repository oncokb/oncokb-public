import React from 'react';
import {
  getShortenPmidsFromList,
  getShortenTextFromList
} from 'app/shared/utils/Utils';

export const PMIDLink: React.FunctionComponent<{ pmids: string }> = props => {
  const pmidList = props.pmids
    .split(/,|\s/)
    .filter(pmid => pmid)
    .map(pmid => pmid.trim());
  return <span>PMID(s): {getShortenPmidsFromList(pmidList)}</span>;
};
