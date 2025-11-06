import React from 'react';
import indexStyles from 'app/index.module.scss';
import { ONCOKB_TM } from 'app/config/constants';

export const CitationText = ({
  highlightLinkout = false,
  boldLinkout = false,
}: {
  highlightLinkout?: boolean;
  boldLinkout?: boolean;
}) => {
  return (
    <span>
      When using {ONCOKB_TM}, please cite:{' '}
      <a
        href="https://aacrjournals.org/cancerdiscovery/article/14/1/49/732527/Quantifying-the-Expanding-Landscape-of-Clinical"
        className={boldLinkout ? 'font-medium' : undefined}
        target="_blank"
        rel="noopener noreferrer"
      >
        Suehnholz et al., Cancer Discovery 2024
      </a>{' '}
      and{' '}
      <a
        href="https://ascopubs.org/doi/full/10.1200/PO.17.00011"
        className={boldLinkout ? 'font-medium' : undefined}
        target="_blank"
        rel="noopener noreferrer"
      >
        Chakravarty et al., JCO PO 2017
      </a>
      .
    </span>
  );
};
