import React from 'react';

import styles from './GenePage.module.scss';
import { Linkout } from 'app/shared/links/Linkout';

export enum ReferenceGenome {
  GRCH37 = 'GRCh37',
  GRCH38 = 'GRCh38'
}

export const ReferenceGenomeInfo: React.FunctionComponent<{
  referenceGenome: ReferenceGenome;
  isoform?: string;
  refseq?: string;
}> = props => {
  return props.isoform || props.refseq ? (
    <div className={styles.sameLineSpans}>
      <span>{props.referenceGenome}</span>
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
