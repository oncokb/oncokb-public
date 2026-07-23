import React from 'react';
import { Alert } from 'react-bootstrap';
import { ProteinChangeValidation } from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  HGVS_NOMENCLATURE_LINK,
  ONCOKB_SUPPORT_EMAIL,
  REFERENCE_GENOME,
} from 'app/config/constants';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import styles from './ProteinChangeValidationView.module.scss';

type ProteinChangeValidationViewProps = {
  // Protein change validation returned by the annotation API
  validation: ProteinChangeValidation;
  // Gene being annotated, e.g. "BRAF"
  hugoSymbol: string;
  referenceGenome: REFERENCE_GENOME;
  // Canonical Ensembl transcript OncoKB annotates against, e.g. "ENST00000288602"
  canonicalTranscript?: string;
};

const SupportEmailLink: React.FunctionComponent = () => (
  <a href={`mailto:${ONCOKB_SUPPORT_EMAIL}`}>{ONCOKB_SUPPORT_EMAIL}</a>
);

const ProteinChangeValidationView: React.FunctionComponent<ProteinChangeValidationViewProps> = ({
  validation,
  hugoSymbol,
  referenceGenome,
  canonicalTranscript,
}) => {
  const geneName = hugoSymbol || 'the gene you are annotating';

  switch (validation.messageType) {
    case 'TRANSCRIPT_SERVICE_DISABLED':
      return (
        <Alert variant="warning">
          <p className={styles.message}>
            We could not validate the protein change because the transcript
            service is disabled. Please contact <SupportEmailLink /> for
            assistance.
          </p>
        </Alert>
      );
    case 'TRANSCRIPT_SERVICE_UNAVAILABLE':
      return (
        <Alert variant="warning">
          <p className={styles.message}>
            We could not validate the protein change because the transcript
            service is temporarily unavailable. Please retry your query. If it
            still does not work, please contact <SupportEmailLink />.
          </p>
        </Alert>
      );
    case 'NO_PROTEIN_SEQUENCE':
      return (
        <Alert variant="warning">
          <p className={styles.message}>
            {geneName} does not have a canonical protein sequence in{' '}
            {referenceGenome}, so we could not validate the protein change.
          </p>
        </Alert>
      );
    case 'NORMALIZED_DELETED_SEQUENCE':
      return (
        <Alert variant="info">
          <p className={styles.message}>
            {validation.message}{' '}
            <ExternalLinkIcon
              link={HGVS_NOMENCLATURE_LINK}
              // The icon defaults to display: flex, which would push it onto its own line
              style={{ display: 'inline-flex' }}
            >
              HGVS Nomenclature
            </ExternalLinkIcon>
          </p>
        </Alert>
      );
    default:
      return (
        <Alert variant="warning">
          <p className={styles.message}>{validation.message}</p>
          {canonicalTranscript && (
            <p className={styles.meta}>
              OncoKB annotates against the canonical transcript{' '}
              {canonicalTranscript}.
            </p>
          )}
        </Alert>
      );
  }
};

export default ProteinChangeValidationView;
