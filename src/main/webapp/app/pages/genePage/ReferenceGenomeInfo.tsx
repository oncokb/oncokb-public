import React from 'react';

import styles from './GenePage.module.scss';
import { Linkout } from 'app/shared/links/Linkout';
import { REFERENCE_GENOME } from 'app/config/constants';
import { EnsemblGene } from 'app/shared/api/generated/OncoKbPrivateAPI';

export const ReferenceGenomeInfo: React.FunctionComponent<{
  referenceGenomeName: REFERENCE_GENOME;
  ensemblGene?: EnsemblGene;
  isoform?: string;
  refseq?: string;
}> = props => {
  return props.isoform || props.refseq ? (
    <div className={styles.sameLineSpans}>
      <span>{props.referenceGenomeName}</span>
      {props.ensemblGene && (
        <>
          <span
            style={{ whiteSpace: 'nowrap' }}
          >{`Chr${props.ensemblGene.chromosome}:${props.ensemblGene.start}-${props.ensemblGene.end}`}</span>
          <span>
            <Linkout
              className={styles.lowKeyLinkout}
              link={`https://${
                props.referenceGenomeName === REFERENCE_GENOME.GRCh37
                  ? 'grch37'
                  : 'www'
              }.ensembl.org/id/${props.ensemblGene.ensemblGeneId}`}
            >
              {props.ensemblGene.ensemblGeneId}
            </Linkout>
          </span>
        </>
      )}
      {props.isoform && (
        <span>
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
