import React from 'react';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import { EnsemblGene } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { Linkout } from 'app/shared/links/Linkout';
import styles from 'app/pages/genePage/GenePage.module.scss';
import { REFERENCE_GENOME } from 'app/config/constants';
import { ReferenceGenomeInfo } from 'app/pages/genePage/ReferenceGenomeInfo';

const EnsemblInfo: React.FunctionComponent<{
  gene: Gene;
  ensemblGenes: EnsemblGene[];
}> = props => {
  const gene = props.gene;
  const additionalInfo: React.ReactNode[] = [];

  if (gene.entrezGeneId > 0) {
    additionalInfo.push(
      <div key="geneId">
        Gene ID:{' '}
        {gene.entrezGeneId > 0 ? (
          <Linkout
            className={styles.lowKeyLinkout}
            link={`https://www.ncbi.nlm.nih.gov/gene/${gene.entrezGeneId}`}
          >
            {gene.entrezGeneId}
          </Linkout>
        ) : (
          <span className={'ml-1'}>{gene.entrezGeneId}</span>
        )}
      </div>
    );
  }

  const grch37CanonicalEnsembl = props.ensemblGenes.filter(
    ensemblGene =>
      ensemblGene.canonical &&
      ensemblGene.referenceGenome === REFERENCE_GENOME.GRCh37
  );
  const grch38CanonicalEnsembl = props.ensemblGenes.filter(
    ensemblGene =>
      ensemblGene.canonical &&
      ensemblGene.referenceGenome === REFERENCE_GENOME.GRCh38
  );

  if (
    grch37CanonicalEnsembl.length > 0 ||
    gene.grch37Isoform ||
    gene.grch37RefSeq
  ) {
    additionalInfo.push(
      <ReferenceGenomeInfo
        key={REFERENCE_GENOME.GRCh37}
        referenceGenomeName={REFERENCE_GENOME.GRCh37}
        ensemblGene={grch37CanonicalEnsembl[0]}
        isoform={gene.grch37Isoform}
        refseq={gene.grch37RefSeq}
      />
    );
  }
  if (
    grch38CanonicalEnsembl.length > 0 ||
    gene.grch38Isoform ||
    gene.grch38RefSeq
  ) {
    additionalInfo.push(
      <ReferenceGenomeInfo
        key={REFERENCE_GENOME.GRCh38}
        referenceGenomeName={REFERENCE_GENOME.GRCh38}
        ensemblGene={grch38CanonicalEnsembl[0]}
        isoform={gene.grch38Isoform}
        refseq={gene.grch38RefSeq}
      />
    );
  }

  return <div>{additionalInfo}</div>;
};
export default EnsemblInfo;
