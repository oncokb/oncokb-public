import React from 'react';

export const MskimpactLink: React.FunctionComponent<{}> = () => {
  return (
    <>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="http://www.cbioportal.org/study?id=msk_impact_2017#summary"
      >
        MSK-IMPACT Clinical Sequencing Cohort
      </a>{' '}
      (
      <a
        href="https://pubmed.ncbi.nlm.nih.gov/28481359"
        target="_blank"
        rel="noopener noreferrer"
      >
        Zehir et al., Nat Med 2017
      </a>
      )
    </>
  );
};
