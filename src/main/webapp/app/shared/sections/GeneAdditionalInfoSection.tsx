import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Gene, EnsemblGene } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { NcbiLink } from 'app/shared/links/NcbiLink';
import ShowHideText from 'app/shared/texts/ShowHideText';
import GeneAdditionalInfoTable from 'app/pages/genePage/GeneAdditionalInfoTable';
import { REFERENCE_GENOME } from 'app/config/constants';
import { findLast } from 'app/shared/utils/LodashUtils';

type GeneAdditionalInfoSectionProps = {
  gene: Gene;
  ensemblGenes: EnsemblGene[];
  show: boolean;
  onToggle: () => void;
};

const GeneAdditionalInfoSection: React.FunctionComponent<GeneAdditionalInfoSectionProps> = ({
  gene,
  ensemblGenes,
  show,
  onToggle,
}) => {
  const grch37ensemblGene = findLast(
    ensemblGenes,
    item => item.referenceGenome === REFERENCE_GENOME.GRCh37
  );
  const grch38ensemblGene = findLast(
    ensemblGenes,
    item => item.referenceGenome === REFERENCE_GENOME.GRCh38
  );

  return (
    <>
      <div className={'d-flex'}>
        <NcbiLink entrezGeneId={gene.entrezGeneId} />
        <span className={'mx-2'}>|</span>
        <ShowHideText
          show={show}
          title={'additional gene information'}
          content={''}
          onClick={onToggle}
        />
      </div>
      {show && (
        <Row className={'mt-2'}>
          <Col lg={6} md={8} xs={12}>
            <GeneAdditionalInfoTable
              gene={gene}
              grch37ensemblGene={grch37ensemblGene}
              grch38ensemblGene={grch38ensemblGene}
            />
          </Col>
        </Row>
      )}
    </>
  );
};

export default GeneAdditionalInfoSection;
