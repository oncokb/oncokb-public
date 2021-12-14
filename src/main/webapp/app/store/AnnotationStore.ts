import { remoteData } from 'cbioportal-frontend-commons';
import {
  DataFilterType,
  initDefaultMutationMapperStore,
  MutationMapper,
  MutationMapperProps,
  MutationMapperStore,
  TrackName,
} from 'react-mutation-mapper';
import apiClient from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { computed, IReactionDisposer, observable } from 'mobx';
import {
  Alteration,
  Citations,
  Evidence,
  Gene,
} from 'app/shared/api/generated/OncoKbAPI';
import {
  DEFAULT_ANNOTATION,
  DEFAULT_GENE,
  EVIDENCE_TYPES,
  REFERENCE_GENOME,
} from 'app/config/constants';
import {
  BiologicalVariant,
  CancerTypeCount,
  ClinicalVariant,
  EnsemblGene,
  FdaAlteration,
  GeneNumber,
  PortalAlteration,
  VariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import _ from 'lodash';
import { BarChartDatum } from 'app/components/barChart/BarChart';
import {
  getHighestFdaLevel,
  shortenOncogenicity,
} from 'app/shared/utils/Utils';
import { oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';
import { Oncogenicity } from 'app/components/oncokbMutationMapper/OncokbMutationMapper';
import { OncokbMutation } from 'app/components/oncokbMutationMapper/OncokbMutation';
import {
  applyCancerTypeFilter,
  applyOncogenicityFilter,
  findCancerTypeFilter,
  findOncogenicityFilter,
  findPositionFilter,
  ONCOGENICITY_FILTER_TYPE,
} from 'app/components/oncokbMutationMapper/FilterUtils';

interface IAnnotationStore {
  hugoSymbolQuery?: string;
  alterationQuery?: string;
  tumorTypeQuery?: string;
  hgsvgQuery?: string;
  referenceGenomeQuery?: REFERENCE_GENOME;
}

export type TherapeuticImplication = {
  level: string;
  alterations: string;
  alterationsView: JSX.Element;
  drugs: string;
  cancerTypes: string;
  cancerTypesView: JSX.Element;
  citations: Citations;
};

export function getCustomFilterAppliers() {
  return {
    [ONCOGENICITY_FILTER_TYPE]: applyOncogenicityFilter,
    [DataFilterType.CANCER_TYPE]: applyCancerTypeFilter,
  };
}

export class AnnotationStore {
  @observable hugoSymbolQuery: string;
  @observable alterationQuery: string;
  @observable tumorTypeQuery: string;
  @observable hgvsgQuery: string;
  @observable referenceGenomeQuery: REFERENCE_GENOME = REFERENCE_GENOME.GRCh37;

  @computed get cancerTypeFilter() {
    return this.mutationMapperStore.result
      ? findCancerTypeFilter(
          this.mutationMapperStore.result.dataStore.dataFilters
        )
      : undefined;
  }

  @computed get selectedCancerTypes() {
    if (this.cancerTypeFilter) {
      return this.cancerTypeFilter.values;
    } else if (this.selectedPositions.length > 0) {
      return this.barChartData
        .filter(
          data =>
            data.alterations.filter(alteration =>
              this.selectedPositions.includes(alteration.proteinStartPosition)
            ).length > 0
        )
        .map(data => data.x);
    }
    return [];
  }

  @computed
  public get oncogenicityFilter() {
    return this.mutationMapperStore.result
      ? findOncogenicityFilter(
          this.mutationMapperStore.result.dataStore.dataFilters
        )
      : undefined;
  }

  @computed
  public get oncogenicityFilters() {
    return this.oncogenicityFilter ? this.oncogenicityFilter.values : [];
  }

  @computed get positionFilter() {
    return this.mutationMapperStore.result
      ? findPositionFilter(
          this.mutationMapperStore.result.dataStore.selectionFilters
        )
      : undefined;
  }

  @computed get selectedPositions() {
    return this.positionFilter ? this.positionFilter.values : [];
  }

  readonly mutationMapperProps = remoteData<Partial<MutationMapperProps>>({
    await: () => [
      this.gene,
      this.mutationMapperData,
      this.biologicalAlterations,
    ],
    invoke: () => {
      return Promise.resolve({
        ...MutationMapper.defaultProps,
        hugoSymbol: this.gene.result.hugoSymbol,
        entrezGeneId: this.gene.result.entrezGeneId,
        tracks: [TrackName.OncoKB, TrackName.CancerHotspots, TrackName.PTM],
        data: this.mutationMapperData.result,
        oncogenicities: this.uniqOncogenicity,
        isoformOverrideSource: 'mskcc',
        filterAppliersOverride: getCustomFilterAppliers(),
      });
    },
    default: MutationMapper.defaultProps,
  });

  readonly mutationMapperStore = remoteData<MutationMapperStore | undefined>({
    await: () => [this.mutationMapperProps],
    invoke: () => {
      return Promise.resolve(
        initDefaultMutationMapperStore(this.mutationMapperProps.result)
      );
    },
    default: undefined,
  });

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: IAnnotationStore) {
    if (props.hugoSymbolQuery) this.hugoSymbolQuery = props.hugoSymbolQuery;
    if (props.alterationQuery) this.alterationQuery = props.alterationQuery;
    if (props.tumorTypeQuery) this.tumorTypeQuery = props.tumorTypeQuery;
    if (props.hgsvgQuery) this.hgvsgQuery = props.hgsvgQuery;
    if (props.referenceGenomeQuery)
      this.referenceGenomeQuery = props.referenceGenomeQuery;
  }

  readonly gene = remoteData<Gene>({
    invoke: async () => {
      const genes = await apiClient.genesLookupGetUsingGET({
        query: this.hugoSymbolQuery,
      });
      return genes && genes.length > 0 ? genes[0] : DEFAULT_GENE;
    },
    default: DEFAULT_GENE,
  });

  readonly ensemblGenes = remoteData<EnsemblGene[]>({
    await: () => [this.gene],
    invoke: async () => {
      return privateClient.utilsEnsemblGenesGetUsingGET({
        entrezGeneId: this.gene.result.entrezGeneId,
      });
    },
    default: [],
  });

  // this is for easier access of the hugoSymbol from the gene call
  @computed
  get hugoSymbol() {
    return this.gene.result.hugoSymbol;
  }

  readonly geneSummary = remoteData<string | undefined>({
    await: () => [this.gene],
    invoke: async () => {
      const evidences = await apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
        evidenceTypes: EVIDENCE_TYPES.GENE_SUMMARY,
      });
      if (evidences.length > 0) {
        return evidences[0].description;
      } else {
        return undefined;
      }
    },
  });

  readonly geneBackground = remoteData<string | undefined>({
    await: () => [this.gene],
    invoke: async () => {
      const evidences = await apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
        evidenceTypes: EVIDENCE_TYPES.GENE_BACKGROUND,
      });
      if (evidences.length > 0) {
        return evidences[0].description;
      } else {
        return undefined;
      }
    },
  });

  readonly geneNumber = remoteData<GeneNumber>({
    await: () => [this.gene],
    invoke: async () => {
      return privateClient.utilsNumbersGeneGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
      });
    },
    default: {
      gene: DEFAULT_GENE,
      alteration: 0,
      highestSensitiveLevel: '',
      highestResistanceLevel: '',
      highestDiagnosticImplicationLevel: '',
      highestPrognosticImplicationLevel: '',
      tumorType: 0,
    },
  });

  readonly mutationEffect = remoteData<Evidence[]>({
    await: () => [this.gene],
    invoke: async () => {
      return apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
        variant: this.alterationQuery,
        evidenceTypes: EVIDENCE_TYPES.MUTATION_EFFECT,
      });
    },
    default: [],
  });

  readonly clinicalAlterations = remoteData<ClinicalVariant[]>({
    await: () => [this.gene],
    invoke: async () => {
      const clinicalVariants = await privateClient.searchVariantsClinicalGetUsingGET(
        {
          hugoSymbol: this.gene.result.hugoSymbol,
        }
      );
      return clinicalVariants.filter(clinicalVariant =>
        clinicalVariant.variant.referenceGenomes.includes(
          this.referenceGenomeQuery
        )
      );
    },
    default: [],
  });

  @computed
  get highestFdaLevel() {
    return getHighestFdaLevel(this.fdaAlterations.result);
  }

  readonly fdaAlterations = remoteData<FdaAlteration[]>({
    await: () => [this.gene],
    invoke: async () => {
      const geneFdaAlterations = await privateClient.utilsFdaAlterationsGetUsingGET(
        {
          hugoSymbol: this.gene.result.hugoSymbol,
        }
      );
      if (this.alterationQuery) {
        const lowerCaseAltQuery = this.alterationQuery.toLowerCase();
        return geneFdaAlterations.filter(alt => {
          if (
            alt.alteration.alteration &&
            alt.alteration.alteration.toLowerCase() === lowerCaseAltQuery
          ) {
            return true;
          }
          if (
            alt.alteration.name &&
            alt.alteration.name.toLowerCase() === lowerCaseAltQuery
          ) {
            return true;
          }
          return false;
        });
      }
      return geneFdaAlterations;
    },
    default: [],
  });

  readonly biologicalAlterations = remoteData<BiologicalVariant[]>({
    await: () => [this.gene],
    invoke: async () => {
      return privateClient.searchVariantsBiologicalGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
      });
    },
    default: [],
  });

  readonly mutationMapperDataExternal = remoteData<OncokbMutation[]>({
    await: () => [this.gene, this.biologicalAlterations],
    invoke: () => {
      return Promise.resolve(
        this.biologicalAlterations.result.map(alteration => {
          return {
            gene: {
              hugoGeneSymbol: this.gene.result.hugoSymbol,
            },
            proteinChange: alteration.variant.alteration,
            proteinPosEnd: alteration.variant.proteinEnd,
            proteinPosStart: alteration.variant.proteinStart,
            referenceAllele: alteration.variant.refResidues,
            variantAllele: alteration.variant.variantResidues,
            mutationType: alteration.variant.consequence.term,
            oncogenic: shortenOncogenicity(alteration.oncogenic),
          };
        })
      );
    },
  });

  readonly annotationResult = remoteData<VariantAnnotation>({
    await: () => [this.gene],
    invoke: () => {
      return privateClient.utilVariantAnnotationGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
        alteration: this.alterationQuery,
        tumorType: this.tumorTypeQuery,
        referenceGenome: this.referenceGenomeQuery,
      });
    },
    default: DEFAULT_ANNOTATION,
  });

  readonly annotationResultByHgvsg = remoteData<VariantAnnotation>({
    await: () => [],
    invoke: () => {
      return privateClient.utilVariantAnnotationGetUsingGET({
        hgvsg: this.hgvsgQuery,
        tumorType: this.tumorTypeQuery,
        referenceGenome: this.referenceGenomeQuery,
      });
    },
    default: DEFAULT_ANNOTATION,
  });

  readonly portalAlterationSampleCount = remoteData<CancerTypeCount[]>({
    async invoke() {
      return privateClient.utilPortalAlterationSampleCountGetUsingGET({});
    },
    default: [],
  });

  readonly mutationMapperDataPortal = remoteData<PortalAlteration[]>({
    invoke: async () => {
      return privateClient.utilMutationMapperDataGetUsingGET({
        hugoSymbol: this.hugoSymbol,
      });
    },
    default: [],
  });

  readonly mutationMapperData = remoteData<OncokbMutation[]>({
    await: () => [
      this.mutationMapperDataExternal,
      this.mutationMapperDataPortal,
    ],
    invoke: () => {
      // simply mapping by protein change, assuming that protein change is unique for alterations
      const indexedByProteinChange = _.keyBy(
        this.mutationMapperDataExternal.result,
        mutation => mutation.proteinChange
      );

      const data = this.mutationMapperDataPortal.result.map(mutation => {
        const oncogenic = indexedByProteinChange[mutation.proteinChange]
          ? indexedByProteinChange[mutation.proteinChange].oncogenic
          : 'Unknown';
        const referenceAllele = indexedByProteinChange[mutation.proteinChange]
          ? indexedByProteinChange[mutation.proteinChange].referenceAllele
          : undefined;
        const variantAllele = indexedByProteinChange[mutation.proteinChange]
          ? indexedByProteinChange[mutation.proteinChange].variantAllele
          : undefined;

        return {
          gene: {
            hugoGeneSymbol: mutation.gene.hugoSymbol,
          },
          proteinChange: mutation.proteinChange,
          proteinPosEnd: mutation.proteinEndPosition,
          proteinPosStart: mutation.proteinStartPosition,
          referenceAllele,
          variantAllele,
          mutationType: mutation.alterationType,
          oncogenic: shortenOncogenicity(oncogenic),
          cancerType: mutation.cancerType,
        };
      });

      return Promise.resolve(data);
    },
    default: [],
  });

  @computed
  get barChartData() {
    const groupedCanerTypeCounts = _.groupBy(
      this.mutationMapperDataPortal.result,
      'cancerType'
    );
    const cancerGroups = _.keyBy(
      this.portalAlterationSampleCount.result.sort((a, b) =>
        a.count > b.count ? -1 : 1
      ),
      'cancerType'
    );
    return _.reduce(
      groupedCanerTypeCounts,
      (acc, next: PortalAlteration[], cancerType) => {
        const numUniqSampleCountsInCancerType = _.uniq(
          next.map(item => item.sampleId)
        ).length;
        if (cancerGroups[cancerType] && cancerGroups[cancerType].count > 50) {
          acc.push({
            x: cancerType,
            y:
              (100 * numUniqSampleCountsInCancerType) /
              cancerGroups[cancerType].count,
            alterations: next,
            overlay: '',
          } as BarChartDatum);
        }
        return acc;
      },
      [] as BarChartDatum[]
    )
      .sort((a, b) => (a.y > b.y ? -1 : 1))
      .splice(0, 15);
  }

  @computed
  get uniqOncogenicity() {
    return this.calculateOncogenicities(this.biologicalAlterations.result);
  }

  calculateOncogenicities(biologicalAlterations: BiologicalVariant[]) {
    const oncogenicities = _.groupBy(
      _.reduce(
        biologicalAlterations,
        (acc, item) => {
          acc.push({
            ...item,
            oncogenic: shortenOncogenicity(item.oncogenic),
          });
          return acc;
        },
        [] as BiologicalVariant[]
      ),
      'oncogenic'
    );
    const keys = _.keys(oncogenicities).sort(oncogenicitySortMethod);
    return _.reduce(
      keys,
      (acc, oncogenicity) => {
        const datum = oncogenicities[oncogenicity];
        acc.push({
          oncogenicity,
          counts: datum.length,
        });
        return acc;
      },
      [] as Oncogenicity[]
    );
  }

  @computed
  get isFiltered() {
    return (
      this.oncogenicityFilters.length > 0 ||
      this.selectedCancerTypes.length > 0 ||
      this.selectedPositions.length > 0
    );
  }

  @computed
  get filteredBarChartData() {
    return this.selectedCancerTypes.length === 0
      ? this.barChartData
      : this.barChartData.filter(data =>
          this.selectedCancerTypes.includes(data.x)
        );
  }

  @computed
  get filteredAlterationsByBarChart() {
    return _.uniq(
      _.flatten(
        this.filteredBarChartData.map(data =>
          data.alterations.map(alteration => alteration.proteinChange)
        )
      )
    );
  }

  @computed
  get filteredPositionsByBarChart() {
    return _.uniq(
      _.flatten(
        this.filteredBarChartData.map(data =>
          data.alterations.map(alteration => alteration.proteinStartPosition)
        )
      )
    );
  }

  @computed
  get filteredClinicalAlterations() {
    if (this.isFiltered) {
      return this.clinicalAlterations.result.filter(alteration => {
        let isMatch = true;
        if (
          this.oncogenicityFilters.length > 0 &&
          !this.oncogenicityFilters.includes(
            shortenOncogenicity(alteration.oncogenic)
          )
        ) {
          isMatch = false;
        }
        if (
          this.selectedCancerTypes.length > 0 &&
          (_.intersection(
            this.selectedCancerTypes,
            alteration.cancerTypes.map(cancerType => cancerType.mainType)
          ).length === 0 ||
            !this.filteredAlterationsByBarChart.includes(
              alteration.variant.alteration
            ))
        ) {
          isMatch = false;
        }
        if (
          this.selectedPositions.length > 0 &&
          !this.selectedPositions.includes(alteration.variant.proteinStart)
        ) {
          isMatch = false;
        }
        return isMatch;
      });
    } else {
      return this.clinicalAlterations.result;
    }
  }

  @computed
  get filteredBiologicalAlterations() {
    if (this.isFiltered) {
      return this.biologicalAlterations.result.filter(alteration => {
        let isMatch = true;
        if (
          this.oncogenicityFilters.length > 0 &&
          !this.oncogenicityFilters.includes(
            shortenOncogenicity(alteration.oncogenic)
          )
        ) {
          isMatch = false;
        }
        if (
          this.selectedCancerTypes.length > 0 &&
          !this.filteredAlterationsByBarChart.includes(
            alteration.variant.alteration
          )
        ) {
          isMatch = false;
        }
        if (
          this.selectedPositions.length > 0 &&
          !this.selectedPositions.includes(alteration.variant.proteinStart)
        ) {
          isMatch = false;
        }
        return isMatch;
      });
    } else {
      return this.biologicalAlterations.result;
    }
  }

  @computed
  get matchedAlteration(): Alteration | undefined {
    const altLowerCaseQuery = this.alterationQuery?.toLowerCase();
    const matched = this.biologicalAlterations.result.filter(
      alt =>
        alt.variant.alteration.toLowerCase().includes(altLowerCaseQuery) ||
        alt.variant.name.toLowerCase().includes(altLowerCaseQuery)
    );
    return matched.length > 0 ? matched[0].variant : undefined;
  }

  @computed
  get filteredFdaAlterations() {
    const alterations = _.uniq(
      this.filteredBiologicalAlterations.map(alt => alt.variant.name)
    );
    if (this.isFiltered) {
      return this.fdaAlterations.result.filter(alteration => {
        let isMatch = true;
        if (
          this.selectedCancerTypes.length > 0 &&
          !this.selectedCancerTypes.includes(alteration.cancerType)
        ) {
          isMatch = false;
        }
        if (isMatch && !alterations.includes(alteration.alteration.name)) {
          isMatch = false;
        }
        return isMatch;
      });
    } else {
      return this.fdaAlterations.result;
    }
  }

  destroy() {
    for (const reaction of this.reactions) {
      reaction();
    }
  }
}
