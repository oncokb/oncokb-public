import React from 'react';
import { Table } from 'react-bootstrap';
import { EnsemblGene, Gene } from 'app/shared/api/generated/OncoKbPrivateAPI';
import _ from 'lodash';
import { Linkout } from 'app/shared/links/Linkout';
import styles from 'app/pages/genePage/GenePage.module.scss';
import { REFERENCE_GENOME } from 'app/config/constants';

const EnsemblIdLinkout: React.FunctionComponent<{
  ensemblId: string;
  referenceGenome: REFERENCE_GENOME;
}> = props => {
  return (
    <Linkout
      className={styles.lowKeyLinkout}
      link={`https://${
        props.referenceGenome === REFERENCE_GENOME.GRCh37 ? 'grch37' : 'www'
      }.ensembl.org/id/${props.ensemblId}`}
    >
      {props.children ? props.children : props.ensemblId}
    </Linkout>
  );
};
const getEnsemblText = (grch37: string, grch38: string) => {
  if (grch37 === grch38) {
    return (
      <span>
        {grch37} (
        <EnsemblIdLinkout
          ensemblId={grch37}
          referenceGenome={REFERENCE_GENOME.GRCh37}
        >
          {REFERENCE_GENOME.GRCh37}
        </EnsemblIdLinkout>
        /
        <EnsemblIdLinkout
          ensemblId={grch38}
          referenceGenome={REFERENCE_GENOME.GRCh38}
        >
          {REFERENCE_GENOME.GRCh38}
        </EnsemblIdLinkout>
        )
      </span>
    );
  } else {
    return (
      <div>
        {grch37 && (
          <div>
            <EnsemblIdLinkout
              ensemblId={grch37}
              referenceGenome={REFERENCE_GENOME.GRCh37}
            />{' '}
            ({REFERENCE_GENOME.GRCh37})
          </div>
        )}
        {grch38 && (
          <div>
            <EnsemblIdLinkout
              ensemblId={grch38}
              referenceGenome={REFERENCE_GENOME.GRCh38}
            />{' '}
            ({REFERENCE_GENOME.GRCh38})
          </div>
        )}
      </div>
    );
  }
};
const RefSeqLinkout: React.FunctionComponent<{
  refSeq: string;
  referenceGenome: REFERENCE_GENOME;
}> = props => {
  return (
    <Linkout
      className={styles.lowKeyLinkout}
      link={`https://www.ncbi.nlm.nih.gov/nuccore/${props.refSeq}`}
    >
      {props.children ? props.children : props.refSeq}
    </Linkout>
  );
};
const getRefSeqText = (grch37: string, grch38: string) => {
  if (grch37 === grch38) {
    return (
      <span>
        {grch37} (
        <RefSeqLinkout
          refSeq={grch37}
          referenceGenome={REFERENCE_GENOME.GRCh37}
        >
          {REFERENCE_GENOME.GRCh37}
        </RefSeqLinkout>
        /
        <RefSeqLinkout
          refSeq={grch38}
          referenceGenome={REFERENCE_GENOME.GRCh38}
        >
          {REFERENCE_GENOME.GRCh38}
        </RefSeqLinkout>
        )
      </span>
    );
  } else {
    return (
      <div>
        {grch37 && (
          <div>
            <RefSeqLinkout
              refSeq={grch37}
              referenceGenome={REFERENCE_GENOME.GRCh37}
            />{' '}
            ({REFERENCE_GENOME.GRCh37})
          </div>
        )}
        {grch38 && (
          <div>
            <RefSeqLinkout
              refSeq={grch38}
              referenceGenome={REFERENCE_GENOME.GRCh38}
            />{' '}
            ({REFERENCE_GENOME.GRCh38})
          </div>
        )}
      </div>
    );
  }
};

const GeneAdditionalInfoTable: React.FunctionComponent<{
  gene: Gene;
  grch37ensemblGene?: EnsemblGene;
  grch38ensemblGene?: EnsemblGene;
}> = props => {
  const content = [];
  if (props.gene.entrezGeneId > 0) {
    content.push([
      'NCBI Gene',
      <Linkout
        className={styles.lowKeyLinkout}
        link={`https://www.ncbi.nlm.nih.gov/gene/${props.gene.entrezGeneId}`}
      >
        {props.gene.entrezGeneId}
      </Linkout>,
    ]);
  }
  if (props.grch37ensemblGene || props.grch38ensemblGene) {
    content.push([
      'Ensembl Gene',
      getEnsemblText(
        props.grch37ensemblGene?.ensemblGeneId || '',
        props.grch38ensemblGene?.ensemblGeneId || ''
      ),
    ]);
    content.push([
      'Location',
      <div>
        {props.grch37ensemblGene && (
          <div>{`Chr${props.grch37ensemblGene?.chromosome}:${props.grch37ensemblGene?.start}-${props.grch37ensemblGene?.end} (GRch37)`}</div>
        )}
        {props.grch38ensemblGene && (
          <div>{`Chr${props.grch38ensemblGene?.chromosome}:${props.grch38ensemblGene?.start}-${props.grch38ensemblGene?.end} (GRch38)`}</div>
        )}
      </div>,
    ]);
  }
  if (props.gene.grch37Isoform || props.gene.grch38Isoform) {
    content.push([
      'Ensembl Transcript',
      getEnsemblText(props.gene.grch37Isoform, props.gene.grch38Isoform),
    ]);
  }
  if (props.gene.grch37RefSeq || props.gene.grch38RefSeq) {
    content.push([
      'RefSeq',
      getRefSeqText(props.gene.grch37RefSeq, props.gene.grch38RefSeq),
    ]);
  }

  const firstRowTdStyle = { borderTop: 0 };
  return (
    <Table size={'sm'}>
      <tbody>
        {content.map((item, index) => (
          <tr>
            <td style={index === 0 ? firstRowTdStyle : undefined}>{item[0]}</td>
            <td style={index === 0 ? firstRowTdStyle : undefined}>{item[1]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default GeneAdditionalInfoTable;
