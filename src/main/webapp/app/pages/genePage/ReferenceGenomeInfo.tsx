import React from 'react';

import styles from './GenePage.module.scss';
import { Linkout } from 'app/shared/links/Linkout';
import { REFERENCE_GENOME } from 'app/config/constants';

export const ReferenceGenomeInfo: React.FunctionComponent<{
  referenceGenomeName: REFERENCE_GENOME;
  isoform?: string;
  refseq?: string;
}> = props => {
  return props.isoform || props.refseq ? (
    <div className={styles.sameLineSpans}>
      <span>{props.referenceGenomeName}</span>
      {props.isoform && (
        <span>
          Isoform:{' '}
          <Linkout
            className={styles.lowKeyLinkout}
            link={`https://www.ensembl.org/id/${props.isoform}`}
          >
            {props.isoform}
          </Linkout>
        </span>
      )}
      {props.refseq && (
        <span>
          RefSeq:{' '}
          <Linkout
            className={styles.lowKeyLinkout}
            link={`https://www.ncbi.nlm.nih.gov/nuccore/${props.refseq}`}
          >
            {props.refseq}
          </Linkout>
        </span>
      )}
    </div>
  ) : null;
};
