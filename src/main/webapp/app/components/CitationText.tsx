import React from 'react';
import indexStyles from 'app/index.module.scss';

export const CitationText = ({ highlightLinkout = false }: { highlightLinkout?: boolean }) => {
  return (
    <span>
      When using OncoKB, please cite:{' '}
      <a href="http://ascopubs.org/doi/full/10.1200/PO.17.00011" className={highlightLinkout ? indexStyles.orange : ''} target="_blank">
        Chakravarty et al., JCO PO 2017
      </a>
      .
    </span>
  );
};
