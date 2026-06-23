import React from 'react';
import {
  REFERENCE_GENOME,
  getGenomeNexusVariantBaseUrl,
} from 'app/config/constants';
import { AlternativeOncoKbVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { AlterationPageLink } from 'app/shared/utils/UrlUtils';

type AlternativeVariantSummaryProps = {
  alternativeVariant: AlternativeOncoKbVariant;
  referenceGenomeQuery: REFERENCE_GENOME;
  germline: boolean;
  cancerType?: string;
};

const AlternativeVariantSummary = ({
  alternativeVariant,
  referenceGenomeQuery,
  germline,
  cancerType,
}: AlternativeVariantSummaryProps) => {
  return (
    <div>
      The {alternativeVariant.gene} {alternativeVariant.inputVariant} mutation
      is not present on the OncoKB canonical transcript. However, OncoKB
      annotations are available for{' '}
      <AlterationPageLink
        hugoSymbol={alternativeVariant.gene}
        alteration={alternativeVariant.foundAlteration.alteration}
        cancerType={cancerType}
        germline={germline}
      >
        {alternativeVariant.gene}{' '}
        {alternativeVariant.foundAlteration.alteration}
      </AlterationPageLink>
      , the equivalent mutation on the canonical transcript, as identified by{' '}
      <a
        href={`${getGenomeNexusVariantBaseUrl(referenceGenomeQuery)}${
          alternativeVariant.transcriptId
        }:p.${alternativeVariant.foundAlteration.alteration}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Genome Nexus
      </a>
      .
    </div>
  );
};

export default AlternativeVariantSummary;
