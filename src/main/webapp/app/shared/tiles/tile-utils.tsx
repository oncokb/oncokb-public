import HighestLevelEvidence from 'app/pages/somaticGermlineAlterationPage/HighestLevelEvidence';
import {
  VariantAnnotation,
  MutationEffectResp,
  GermlineVariant,
  Query,
  GeneNumber,
} from '../api/generated/OncoKbPrivateAPI';
import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import SomaticGermlineTiles, {
  AlterationTileProps,
} from './SomaticGermlineTiles';
import config, {
  ONCOGENICITY,
  MUTATION_EFFECT,
  ONCOKB_TM,
  GENOME_NEXUS_ANNOTATION_BASE_URL,
  CLINVAR_VARIANT_BASE_URL,
} from 'app/config/constants';
import {
  isPositionalAlteration,
  citationsHasInfo,
  OncoKBOncogenicityIcon,
} from '../utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { CitationTooltip } from 'app/components/CitationTooltip';
import {
  COLOR_ICON_WITH_INFO,
  COLOR_ICON_WITHOUT_INFO,
} from 'app/config/theme';
import {
  Oncogenicity,
  Pathogenicity,
} from 'app/components/oncokbMutationMapper/OncokbMutationMapper';
import axios from 'axios';

function OncogenicInfo({
  isUnknownOncogenicity,
  isVus,
  oncogenicity,
}: {
  isUnknownOncogenicity: boolean;
  oncogenicity: string | undefined;
  isVus: boolean;
  className?: string;
}) {
  return (
    <span style={{ margin: '0px' }} className="h5">
      <span>
        {isUnknownOncogenicity
          ? `${ONCOGENICITY.UNKNOWN} Oncogenic Effect`
          : oncogenicity}
      </span>
      <OncoKBOncogenicityIcon
        oncogenicity={oncogenicity}
        isVus={isVus}
        classNameParent={classnames('d-inline-block my-auto')}
      />
    </span>
  );
}

function MutationEffectIcon({
  mutationEffect,
}: {
  mutationEffect: MutationEffectResp;
}) {
  const hasCitations = citationsHasInfo(mutationEffect.citations);
  const tooltipOverlay = () => (
    <CitationTooltip
      pmids={mutationEffect.citations.pmids}
      abstracts={mutationEffect.citations.abstracts}
    />
  );
  return (
    <span className="h5">
      <span>
        {mutationEffect.knownEffect === MUTATION_EFFECT.UNKNOWN
          ? `${MUTATION_EFFECT.UNKNOWN} Biological Effect`
          : mutationEffect.knownEffect}
      </span>
      {hasCitations ? (
        <DefaultTooltip overlay={tooltipOverlay} key="mutationEffectTooltip">
          <i
            className="fa fa-book mx-1"
            style={{
              fontSize: '0.8em',
              color: hasCitations
                ? COLOR_ICON_WITH_INFO
                : COLOR_ICON_WITHOUT_INFO,
            }}
          ></i>
        </DefaultTooltip>
      ) : null}
    </span>
  );
}
function createHighestLevelOfEvidenceTileProps(
  variantAnnotation: VariantAnnotation | GeneNumber,
  includeTitle: boolean
): AlterationTileProps {
  const {
    highestDiagnosticImplicationLevel,
    highestFdaLevel,
    highestPrognosticImplicationLevel,
    highestResistanceLevel,
    highestSensitiveLevel,
  } = variantAnnotation;
  return {
    title: includeTitle ? 'Highest Level of Evidence' : undefined,
    items: [
      [
        {
          title: 'Therapeutic',
          show: !!highestSensitiveLevel || !!highestResistanceLevel,
          value: (
            <div className={classnames('d-flex', 'flex-row')}>
              <HighestLevelEvidence
                type="Sensitive"
                level={highestSensitiveLevel}
              />
              <HighestLevelEvidence
                type="Resistance"
                level={highestResistanceLevel}
              />
            </div>
          ),
        },
        {
          title: 'Diagnostic',
          show: !!highestDiagnosticImplicationLevel,
          value: (
            <HighestLevelEvidence
              type="DiagnosticImplication"
              level={highestDiagnosticImplicationLevel}
            />
          ),
        },
      ],
      [
        {
          title: 'Prognostic',
          show: !!highestPrognosticImplicationLevel,
          value: (
            <HighestLevelEvidence
              type="PrognosticImplication"
              level={highestPrognosticImplicationLevel}
            />
          ),
        },
        {
          title: 'FDA',
          show: !!highestFdaLevel,
          value: <HighestLevelEvidence type="Fda" level={highestFdaLevel} />,
        },
      ],
    ],
  };
}

function createMutationEffectTileProps(
  variantAnnotation: VariantAnnotation,
  includeTitle: boolean
): AlterationTileProps {
  const query = variantAnnotation.query;
  const isPositionalAlt = isPositionalAlteration(
    query.proteinStart,
    query.proteinEnd,
    query.consequence
  );
  const { mutationEffect, oncogenic, vus } = variantAnnotation;

  const isUnknownOncogenicity =
    !oncogenic || oncogenic === ONCOGENICITY.UNKNOWN;
  return {
    title: includeTitle ? 'Mutation Effect' : undefined,
    items: [
      [
        {
          title: 'Oncogenicity',
          show: !isUnknownOncogenicity || !isPositionalAlt,
          value: (
            <OncogenicInfo
              oncogenicity={oncogenic}
              isVus={vus}
              isUnknownOncogenicity={isUnknownOncogenicity}
            />
          ),
        },
        {
          title: 'Biological Effect',
          show:
            mutationEffect &&
            (mutationEffect.knownEffect !== MUTATION_EFFECT.UNKNOWN ||
              isPositionalAlt),
          value: <MutationEffectIcon mutationEffect={mutationEffect} />,
        },
      ],
    ],
  };
}

function createPathogenicityTileProps(
  variantAnnotation: GermlineVariant,
  clinvarData: ClinvarData | undefined | null,
  includeTitle: boolean
): AlterationTileProps {
  let clinvarPathogenicity = '';
  if (clinvarData === null || clinvarData?.pathogenicity === '') {
    clinvarPathogenicity = 'Not Available';
  } else if (clinvarData) {
    clinvarPathogenicity = clinvarData.pathogenicity
      .replace(/_/g, ' ')
      .replace(/\|/g, ';');
    clinvarPathogenicity =
      clinvarPathogenicity.charAt(0).toUpperCase() +
      clinvarPathogenicity.slice(1);
  }

  return {
    title: includeTitle ? 'Pathogenicity' : undefined,
    items: [
      [
        {
          title: ONCOKB_TM,
          value: variantAnnotation.pathogenic,
        },
        {
          title: 'ClinVar',
          value: clinvarPathogenicity,
          link:
            clinvarData?.clinvarId && clinvarData?.pathogenicity
              ? `${CLINVAR_VARIANT_BASE_URL}/${clinvarData.clinvarId}`
              : undefined,
        },
      ],
    ],
  };
}

function createGeneticRiskTileProps(
  variantAnnotation: GermlineVariant,
  includeTitle: boolean
): AlterationTileProps {
  return {
    title: includeTitle ? 'Genetic Risk' : undefined,
    items: [
      [
        {
          title: 'Penetrance',
          value: variantAnnotation.penetrance,
        },
      ],
    ],
  };
}

type SomaticGermlineAlterationTilesProps = {
  includeTitle: boolean;
  isGermline: boolean;
  variantAnnotation: VariantAnnotation;
};

type ClinvarData = { pathogenicity: string; clinvarId: number | undefined };

export function SomaticGermlineAlterationTiles({
  includeTitle,
  ...rest
}: SomaticGermlineAlterationTilesProps) {
  const tiles: AlterationTileProps[] = [];
  const isGermline = rest.isGermline;

  const [clinvar, setClinvar] = useState<ClinvarData | undefined | null>(
    undefined
  );

  useEffect(() => {
    async function fetchClinvarFromGenomeNexus() {
      const response = await axios.get(
        `${GENOME_NEXUS_ANNOTATION_BASE_URL}/${rest.variantAnnotation.query.hugoSymbol}:${rest.variantAnnotation.query.alteration}?fields=clinvar`
      );
      if (!response.data.successfully_annotated) {
        setClinvar(null);
        return;
      }
      const clinvarAnnotation = response.data.clinvar.annotation;
      if (clinvarAnnotation) {
        setClinvar({
          pathogenicity: clinvarAnnotation.clinicalSignificance,
          clinvarId: clinvarAnnotation.clinvarId,
        });
      } else {
        setClinvar(null);
      }
    }

    if (isGermline) {
      fetchClinvarFromGenomeNexus();
    }
  }, [setClinvar, isGermline, GENOME_NEXUS_ANNOTATION_BASE_URL]);

  if (isGermline) {
    tiles.push(
      createPathogenicityTileProps(
        rest.variantAnnotation.germline,
        clinvar,
        includeTitle
      )
    );
    tiles.push(
      createGeneticRiskTileProps(rest.variantAnnotation.germline, includeTitle)
    );
  } else {
    tiles.push(
      createMutationEffectTileProps(rest.variantAnnotation, includeTitle)
    );
    tiles.push(
      createHighestLevelOfEvidenceTileProps(
        rest.variantAnnotation,
        includeTitle
      )
    );
  }

  return <SomaticGermlineTiles tiles={tiles} />;
}

function makeTwoColumnRow<T>(arr: T[]): [T, T][] {
  const columnSize = 2;
  const rows: [T, T][] = [];
  for (let tableRow = 0; tableRow < arr.length; tableRow += 2) {
    const columns: T[] = [];
    for (
      let tableColumn = tableRow;
      tableColumn < arr.length && tableColumn < tableRow + columnSize;
      tableColumn++
    ) {
      columns.push(arr[tableColumn]);
    }
    rows.push(columns as [T, T]);
  }
  return rows;
}

export type SomaticGermlineGeneInfoTilesProps = {
  isGermline: boolean;
  geneNumber: GeneNumber;
  oncogenicities: Oncogenicity[];
  pathogenicities: Pathogenicity[];
};

export function SomaticGermlineGeneInfoTiles({
  isGermline,
  geneNumber,
  oncogenicities,
  pathogenicities,
}: SomaticGermlineGeneInfoTilesProps) {
  const tiles: AlterationTileProps[] = [];
  const hasGeneticRiskInfo =
    geneNumber.penetrance || geneNumber.inheritanceMechanism;

  if (hasGeneticRiskInfo) {
    tiles.push({
      title: 'Genetic Risk',
      items: [
        [
          {
            title: 'Penetrance',
            value: geneNumber.penetrance,
          },
        ],
      ],
    });
  }
  tiles.push(createHighestLevelOfEvidenceTileProps(geneNumber, true));
  tiles.push({
    title: `Annotated ${isGermline ? 'Variants' : 'Alterations'}`,
    items: isGermline
      ? makeTwoColumnRow(
          pathogenicities.map(pathogenicity => {
            return {
              title: pathogenicity.pathogenicity,
              value: pathogenicity.counts.toString(),
            };
          })
        )
      : makeTwoColumnRow(
          oncogenicities.map(oncogenicity => {
            return {
              title: oncogenicity.oncogenicity,
              value: oncogenicity.counts.toString(),
            };
          })
        ),
  });

  return <SomaticGermlineTiles tiles={tiles} />;
}
