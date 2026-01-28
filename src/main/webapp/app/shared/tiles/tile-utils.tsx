import HighestLevelEvidence from 'app/pages/somaticGermlineAlterationPage/HighestLevelEvidence';
import {
  GermlineVariantAnnotation,
  MutationEffectResp,
  GeneNumber,
} from '../api/generated/OncoKbPrivateAPI';
import type { VariantAnnotation } from 'app/store/AnnotationStore';
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
  MutationEffect,
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
  includeTitle: boolean,
  isGermline = false
): AlterationTileProps {
  const query = variantAnnotation.query;
  const isPositionalAlt = isPositionalAlteration(
    query.proteinStart,
    query.proteinEnd,
    query.consequence
  );
  const mutationEffect = variantAnnotation.mutationEffect;
  const oncogenic =
    'oncogenic' in variantAnnotation ? variantAnnotation.oncogenic : undefined;
  const vus = variantAnnotation.vus;

  const isUnknownOncogenicity =
    !oncogenic || oncogenic === ONCOGENICITY.UNKNOWN;
  return {
    title: includeTitle ? 'Mutation Effect' : undefined,
    items: [
      [
        {
          title: 'Oncogenicity',
          show: !isGermline && (!isUnknownOncogenicity || !isPositionalAlt),
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
  variantAnnotation: GermlineVariantAnnotation,
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
  variantAnnotation: GermlineVariantAnnotation,
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
  grch37Isoform: string;
};

type ClinvarData = { pathogenicity: string; clinvarId: number | undefined };

export function SomaticGermlineAlterationTiles({
  includeTitle,
  ...rest
}: SomaticGermlineAlterationTilesProps) {
  const tiles: AlterationTileProps[] = [];
  const isGermline = rest.isGermline;
  const germlineAnnotation = isGermline
    ? (rest.variantAnnotation as GermlineVariantAnnotation)
    : undefined;
  const hasPathogenicity = !!germlineAnnotation?.pathogenic;
  const hasMutationEffect = !!rest.variantAnnotation.mutationEffect
    ?.knownEffect;
  const hasPenetrance = !!germlineAnnotation?.penetrance;

  const [clinvar, setClinvar] = useState<ClinvarData | undefined | null>(
    undefined
  );

  useEffect(() => {
    async function fetchClinvarFromGenomeNexus() {
      const response = await axios.get(
        `${GENOME_NEXUS_ANNOTATION_BASE_URL}/${rest.grch37Isoform}:${rest.variantAnnotation.query.alteration}?fields=clinvar`
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

    if (isGermline && hasPathogenicity) {
      fetchClinvarFromGenomeNexus();
    }
  }, [
    setClinvar,
    isGermline,
    hasPathogenicity,
    rest.grch37Isoform,
    rest.variantAnnotation.query.alteration,
    GENOME_NEXUS_ANNOTATION_BASE_URL,
  ]);

  if (isGermline) {
    if (hasPathogenicity) {
      tiles.push(
        createPathogenicityTileProps(
          germlineAnnotation!,
          clinvar,
          includeTitle
        )
      );
    } else if (hasMutationEffect) {
      tiles.push(
        createMutationEffectTileProps(
          rest.variantAnnotation,
          includeTitle,
          isGermline
        )
      );
    }
    if (hasPenetrance) {
      tiles.push(
        createGeneticRiskTileProps(
          germlineAnnotation!,
          includeTitle
        )
      );
    }
  } else {
    tiles.push(
      createMutationEffectTileProps(
        rest.variantAnnotation,
        includeTitle,
        isGermline
      )
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
  mutationEffects: MutationEffect[];
};

export function SomaticGermlineGeneInfoTiles({
  isGermline,
  geneNumber,
  oncogenicities,
  pathogenicities,
  mutationEffects,
}: SomaticGermlineGeneInfoTilesProps) {
  const tiles: AlterationTileProps[] = [];
  const hasGeneticRiskInfo = !!geneNumber.penetrance;

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

  const annotatedTitle = `Annotated ${isGermline ? 'Variants' : 'Alterations'}`;
  let annotatedItems: { title: string; value: string }[] = [];
  if (isGermline) {
    if (pathogenicities.length > 0) {
      annotatedItems = pathogenicities.map(p => ({
        title: p.pathogenicity,
        value: p.counts.toString(),
      }));
    } else {
      // Some genes don't have pathogenic variants, so we fall back to mutation effect (DPYD)
      annotatedItems = mutationEffects.map(m => ({
        title: m.mutationEffect,
        value: m.counts.toString(),
      }));
    }
  } else {
    annotatedItems = oncogenicities.map(o => ({
      title: o.oncogenicity,
      value: o.counts.toString(),
    }));
  }

  tiles.push({
    title: annotatedTitle,
    items: makeTwoColumnRow(annotatedItems),
  });

  return <SomaticGermlineTiles tiles={tiles} />;
}
