import React from 'react';
import { Table } from 'react-bootstrap';
import { EnsemblGene, Gene } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { Linkout } from 'app/shared/links/Linkout';
import { REFERENCE_GENOME } from 'app/config/constants';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';

const EnsemblIdLinkout: React.FunctionComponent<{
  ensemblId: string;
  referenceGenome: REFERENCE_GENOME;
  className?: string;
}> = props => {
  return (
    <ExternalLinkIcon
      link={`https://${
        props.referenceGenome === REFERENCE_GENOME.GRCh37 ? 'grch37' : 'www'
      }.ensembl.org/id/${props.ensemblId}`}
      className={props.className}
    >
      {props.children ? props.children : props.ensemblId}
    </ExternalLinkIcon>
  );
};
const getEnsemblText = (grch37: string, grch38: string) => {
  if (grch37 === grch38) {
    return (
      <span className={'d-flex'}>
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
      <div className={'d-flex flex-column'}>
        {grch37 && (
          <div className={'d-flex'}>
            {grch37} (
            <EnsemblIdLinkout
              ensemblId={grch37}
              referenceGenome={REFERENCE_GENOME.GRCh37}
            >
              {REFERENCE_GENOME.GRCh37}
            </EnsemblIdLinkout>
            )
          </div>
        )}
        {grch38 && (
          <div className={'d-flex'}>
            {grch38} (
            <EnsemblIdLinkout
              ensemblId={grch38}
              referenceGenome={REFERENCE_GENOME.GRCh38}
            >
              {REFERENCE_GENOME.GRCh38}
            </EnsemblIdLinkout>
            )
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
    <ExternalLinkIcon
      link={`https://www.ncbi.nlm.nih.gov/nuccore/${props.refSeq}`}
    >
      {props.children ? props.children : props.refSeq}
    </ExternalLinkIcon>
  );
};
const getRefSeqText = (grch37: string, grch38: string) => {
  if (grch37 === grch38) {
    return (
      <span className={'d-flex'}>
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

const getTableDataStyle = (row: number, col: number) => {
  const style: Partial<React.CSSProperties> = {};
  if (row === 0) {
    style.borderTop = 0;
  }
  if (col === 0) {
    style.width = 160;
  }
  return style;
};
const GeneAdditionalInfoTable: React.FunctionComponent<{
  gene: Gene;
  grch37ensemblGene?: EnsemblGene;
  grch38ensemblGene?: EnsemblGene;
}> = props => {
  const content = [];
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
          <div>{`Chr${props.grch37ensemblGene?.chromosome}:${props.grch37ensemblGene?.start}-${props.grch37ensemblGene?.end} (GRCh37)`}</div>
        )}
        {props.grch38ensemblGene && (
          <div>{`Chr${props.grch38ensemblGene?.chromosome}:${props.grch38ensemblGene?.start}-${props.grch38ensemblGene?.end} (GRCh38)`}</div>
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

  return (
    <Table size={'sm'}>
      <tbody>
        {content.map((item, index) => (
          <tr key={`key-${item[0]}`}>
            <td style={getTableDataStyle(index, 0)}>
              <b>{item[0]}</b>
            </td>
            <td style={getTableDataStyle(index, 1)}>{item[1]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export default GeneAdditionalInfoTable;
