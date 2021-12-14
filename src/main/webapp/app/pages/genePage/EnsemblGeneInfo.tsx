import React from 'react';

import styles from './GenePage.module.scss';
import { Linkout } from 'app/shared/links/Linkout';
import { REFERENCE_GENOME } from 'app/config/constants';
import { EnsemblGene } from 'app/shared/api/generated/OncoKbPrivateAPI';

export const EnsemblGeneInfo: React.FunctionComponent<{
  referenceGenomeName: REFERENCE_GENOME;
  ensemblGene: EnsemblGene;
}> = props => {
  return (
    <div className={styles.sameLineSpans}>
      <span>{props.referenceGenomeName}</span>
      <span>
        Ensembl Gene ID:{' '}
        <Linkout
          className={styles.lowKeyLinkout}
          link={`https://www.ensembl.org/id/${props.ensemblGene.ensemblGeneId}`}
        >
          {props.ensemblGene.ensemblGeneId}
        </Linkout>
      </span>
      <span>{` (Chr ${props.ensemblGene.chromosome}, ${props.ensemblGene.start}, ${props.ensemblGene.end}, ${props.ensemblGene.strand})`}</span>
    </div>
  );
};
