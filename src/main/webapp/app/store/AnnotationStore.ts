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
  DEFAULT_GENE_NUMBER,
  EVIDENCE_TYPES,
  REFERENCE_GENOME,
} from 'app/config/constants';
import {
  BiologicalVariant,
  CancerTypeCount,
  ClinicalVariant,
  EnsemblGene,
  GeneNumber,
  PortalAlteration,
  TumorType,
  VariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { BarChartDatum } from 'app/components/barChart/BarChart';
import {
  getAlterationName,
  getCancerTypeNameFromOncoTreeType,
  isOncogenic,
  shortenOncogenicity,
  shortenPathogenicity,
} from 'app/shared/utils/Utils';
import {
  oncogenicitySortMethod,
  pathogenicitySortMethod,
} from 'app/shared/utils/ReactTableUtils';
import {
  Oncogenicity,
  Pathogenicity,
} from 'app/components/oncokbMutationMapper/OncokbMutationMapper';
import { OncokbMutation } from 'app/components/oncokbMutationMapper/OncokbMutation';
import {
  applyCancerTypeFilter,
  applyOncogenicityFilter,
  findCancerTypeFilter,
  findOncogenicityFilter,
  findPositionFilter,
  ONCOGENICITY_FILTER_TYPE,
} from 'app/components/oncokbMutationMapper/FilterUtils';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { AnnotationType } from 'app/pages/annotationPage/AnnotationPage';
import {
  groupBy,
  intersection,
  keyBy,
  uniq,
} from 'app/shared/utils/LodashUtils';

export interface IAnnotationStore {
  type: AnnotationType;
  germline?: boolean;
  hugoSymbolQuery?: string;
  alterationQuery?: string;
  tumorTypeQuery?: string;
  hgsvgQuery?: string;
  genomicChangeQuery?: string;
  referenceGenomeQuery?: REFERENCE_GENOME;
}

export type TherapeuticImplication = {
  level: string;
  fdaLevel?: string;
  alterations: string;
  alterationsView: JSX.Element;
  drugs: string;
  cancerTypes: string;
  cancerTypesView: JSX.Element;
  citations: Citations;
  drugDescription: string;
};

export type FdaImplication = {
  level: string;
  alteration: Alteration;
  alterationView: JSX.Element;
  cancerType: string;
  cancerTypeView: JSX.Element;
};

export function getCustomFilterAppliers() {
  return {
    [ONCOGENICITY_FILTER_TYPE]: applyOncogenicityFilter,
    [DataFilterType.CANCER_TYPE]: applyCancerTypeFilter,
  };
}

export class AnnotationStore {
  @observable germline: boolean;
  @observable hugoSymbolQuery: string;
  @observable alterationQuery: string;
  @observable tumorTypeQuery: string;
  @observable hgvsgQuery: string;
  @observable genomicChangeQuery: string;
  @observable referenceGenomeQuery: REFERENCE_GENOME = REFERENCE_GENOME.GRCh37;

  private readonly annotationType: AnnotationType;

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
    this.annotationType = props.type;
    if (props.germline !== undefined) this.germline = props.germline;
    if (props.hugoSymbolQuery) this.hugoSymbolQuery = props.hugoSymbolQuery;
    if (props.alterationQuery) this.alterationQuery = props.alterationQuery;
    if (props.tumorTypeQuery) this.tumorTypeQuery = props.tumorTypeQuery;
    if (props.hgsvgQuery) this.hgvsgQuery = props.hgsvgQuery;
    if (props.genomicChangeQuery)
      this.genomicChangeQuery = props.genomicChangeQuery;
    if (props.referenceGenomeQuery)
      this.referenceGenomeQuery = props.referenceGenomeQuery;
  }

  readonly gene = remoteData<Gene>({
    await: () => {
      return this.hgvsgQuery ? [this.annotationResultByHgvsg] : [];
    },
    invoke: async () => {
      try {
        const genes = await apiClient.genesLookupGetUsingGET({
          query: this.hgvsgQuery
            ? this.annotationResultByHgvsg.result.query.hugoSymbol
            : this.hugoSymbolQuery,
        });
        return genes && genes.length > 0 ? genes[0] : DEFAULT_GENE;
      } catch (e) {
        notifyError(e, 'Error finding gene');
        return DEFAULT_GENE;
      }
    },
    default: DEFAULT_GENE,
  });

  readonly alteration = remoteData<Alteration | undefined>({
    await: () => [this.gene],
    invoke: async () => {
      try {
        const variant = this.hgvsgQuery
          ? this.annotationResultByHgvsg.result.query.alteration
          : this.alterationQuery;
        if (!variant) {
          return undefined;
        }
        const variants = await apiClient.variantsLookupGetUsingGET({
          hugoSymbol: this.gene.result.hugoSymbol
            ? this.gene.result.hugoSymbol
            : this.hugoSymbolQuery,
          variant,
        });
        return variants[0];
      } catch (e) {
        notifyError(e, 'Error finding alteration');
        return undefined;
      }
    },
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

  readonly geneSummary = remoteData<string | undefined>({
    await: () => [this.gene],
    invoke: async () => {
      try {
        let geneSummary = undefined;

        const somaticEvidencesPromise = apiClient.evidencesLookupGetUsingGET({
          hugoSymbol: this.gene.result.hugoSymbol,
          evidenceTypes: EVIDENCE_TYPES.GENE_SUMMARY,
        });

        if (this.germline) {
          const germlineEvidencesPromise = apiClient.evidencesLookupGetUsingGET(
            {
              hugoSymbol: this.gene.result.hugoSymbol,
              evidenceTypes: EVIDENCE_TYPES.GENE_SUMMARY,
              germline: true,
            }
          );

          const [somaticEvidences, germlineEvidences] = await Promise.all([
            somaticEvidencesPromise,
            germlineEvidencesPromise,
          ]);
          if (somaticEvidences.length > 0) {
            geneSummary = somaticEvidences[0].description;
          }

          if (germlineEvidences.length > 0) {
            if (geneSummary === undefined) {
              geneSummary = germlineEvidences[0].description;
            } else {
              geneSummary += ' ' + germlineEvidences[0].description;
            }
          }
        } else {
          const somaticEvidences = await somaticEvidencesPromise;
          if (somaticEvidences.length > 0) {
            geneSummary = somaticEvidences[0].description;
          }
        }

        return geneSummary;
      } catch (e) {
        notifyError(e, 'Error loading gene summary');
        return undefined;
      }
    },
  });

  readonly geneBackground = remoteData<string | undefined>({
    await: () => [this.gene],
    invoke: async () => {
      try {
        const evidences = await apiClient.evidencesLookupGetUsingGET({
          hugoSymbol: this.gene.result.hugoSymbol,
          evidenceTypes: EVIDENCE_TYPES.GENE_BACKGROUND,
        });
        if (evidences.length > 0) {
          return evidences[0].description;
        } else {
          return undefined;
        }
      } catch (e) {
        notifyError(e, 'Error loading gene background');
        return undefined;
      }
    },
  });

  readonly genomicIndicators = remoteData<Evidence[]>({
    await: () => [this.gene],
    invoke: async () => {
      try {
        const evidences = await apiClient.evidencesLookupGetUsingGET({
          hugoSymbol: this.gene.result.hugoSymbol,
          evidenceTypes: EVIDENCE_TYPES.GENOMIC_INDICATOR,
          germline: true,
        });
        if (evidences.length > 0) {
          return evidences;
        } else {
          return [];
        }
      } catch (e) {
        notifyError(e, 'Error loading genomic indicators');
        return [];
      }
    },
    default: [],
  });

  readonly geneNumber = remoteData<GeneNumber>({
    await: () => [this.gene],
    invoke: async () => {
      try {
        return await privateClient.utilsNumbersGeneGetUsingGET({
          hugoSymbol: this.gene.result.hugoSymbol,
          germline: this.germline,
        });
      } catch (e) {
        return DEFAULT_GENE_NUMBER;
      }
    },
    default: DEFAULT_GENE_NUMBER,
  });

  readonly mutationEffect = remoteData<Evidence[]>({
    await: () => [this.gene],
    invoke: async () => {
      return apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
        variant: this.alterationQuery,
        germline: this.germline,
        evidenceTypes: EVIDENCE_TYPES.MUTATION_EFFECT,
      });
    },
    default: [],
  });

  readonly clinicalAlterations = remoteData<ClinicalVariant[]>({
    await: () => [this.gene],
    invoke: async () => {
      try {
        const clinicalVariants = await privateClient.searchVariantsClinicalGetUsingGET(
          {
            hugoSymbol: this.gene.result.hugoSymbol,
            germline: this.germline,
          }
        );
        return clinicalVariants.filter(clinicalVariant =>
          clinicalVariant.variant.referenceGenomes.includes(
            this.referenceGenomeQuery
          )
        );
      } catch (e) {
        notifyError(e, 'Error loading clinical alterations');
        return [];
      }
    },
    default: [],
  });

  readonly biologicalAlterations = remoteData<BiologicalVariant[]>({
    await: () => [this.gene],
    invoke: async () => {
      return privateClient.searchVariantsBiologicalGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
        germline: this.germline,
      });
    },
    default: [],
  });

  readonly relevantAlterations = remoteData<Alteration[]>({
    await: () => [this.gene, this.alteration],
    invoke: async () => {
      if (!this.gene.result.entrezGeneId || !this.alteration.result) {
        return [];
      }
      return privateClient.utilRelevantAlterationsGetUsingGET({
        entrezGeneId: this.gene.result.entrezGeneId,
        alteration: this.alteration.result
          ? this.alteration.result.alteration
          : this.alterationQuery,
        referenceGenome: this.referenceGenomeQuery,
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
    default: [],
  });

  readonly defaultAnnotationResult = remoteData<VariantAnnotation>({
    invoke() {
      return Promise.resolve(DEFAULT_ANNOTATION);
    },
    default: DEFAULT_ANNOTATION,
  });

  readonly annotationResult = remoteData<VariantAnnotation>({
    await: () => [this.gene],
    invoke: () => {
      return privateClient.utilVariantAnnotationGetUsingGET({
        hugoSymbol: this.gene.result.hugoSymbol,
        alteration: this.alterationQuery,
        tumorType: this.tumorTypeQuery,
        referenceGenome: this.referenceGenomeQuery,
        germline: this.germline,
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

  readonly annotationResultByGenomicChange = remoteData<VariantAnnotation>({
    await: () => [],
    invoke: () => {
      return privateClient.utilVariantAnnotationGetUsingGET({
        genomicChange: this.genomicChangeQuery,
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
      const indexedByProteinChange = keyBy(
        this.mutationMapperDataExternal.result,
        'proteinChange'
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

  readonly allCancerTypes = remoteData<TumorType[]>({
    await: () => [],
    async invoke() {
      const result = await privateClient.utilsTumorTypesGetUsingGET({});
      return result.sort();
    },
    default: [],
  });

  calculateOncogenicities(biologicalAlterations: BiologicalVariant[]) {
    const oncogenicities = biologicalAlterations.reduce((acc, item) => {
      const oncogenic = shortenOncogenicity(item.oncogenic);
      const variant = {
        ...item,
        oncogenic,
      };
      if (!acc[oncogenic]) acc[oncogenic] = [];
      acc[oncogenic].push(variant);
      return acc;
    }, {});
    const keys = Object.keys(oncogenicities).sort(oncogenicitySortMethod);
    return keys.reduce((acc, oncogenicity) => {
      const datum = oncogenicities[oncogenicity];
      acc.push({
        oncogenicity,
        counts: datum.length,
      });
      return acc;
    }, [] as Oncogenicity[]);
  }

  calculatePathogenicities(biologicalAlterations: BiologicalVariant[]) {
    const pathogenicities = biologicalAlterations.reduce((acc, item) => {
      const pathogenic = shortenPathogenicity(item.pathogenic);
      const variant = {
        ...item,
        pathogenic,
      };
      if (!acc[pathogenic]) acc[pathogenic] = [];
      acc[pathogenic].push(variant);
      return acc;
    }, {});
    const keys = Object.keys(pathogenicities).sort(pathogenicitySortMethod);
    return keys.reduce((acc, pathogenicity) => {
      const datum = pathogenicities[pathogenicity];
      acc.push({
        pathogenicity,
        counts: datum.length,
      });
      return acc;
    }, [] as Pathogenicity[]);
  }

  @computed
  get annotationData() {
    switch (this.annotationType) {
      case AnnotationType.GENOMIC_CHANGE:
        return this.annotationResultByGenomicChange;
        break;
      case AnnotationType.HGVSG:
        return this.annotationResultByHgvsg;
        break;
      case AnnotationType.PROTEIN_CHANGE:
        return this.annotationResult;
        break;
      default:
        return this.defaultAnnotationResult;
        break;
    }
  }

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

  // this is for easier access of the hugoSymbol from the gene call
  @computed
  get hugoSymbol() {
    if (
      this.annotationType === AnnotationType.GENE ||
      this.annotationType === AnnotationType.PROTEIN_CHANGE
    ) {
      return this.gene.result.hugoSymbol;
    } else {
      return this.annotationData.result.query.hugoSymbol;
    }
  }

  // need to pass all observables from @computed, so they can be monitored by mobx
  computeAlterationName(
    annotationType: AnnotationType,
    alteration: any,
    alterationQuery: string,
    annotationData: any,
    showDiff: boolean
  ) {
    if (annotationType === AnnotationType.PROTEIN_CHANGE) {
      return getAlterationName(
        alteration.result === undefined
          ? alterationQuery
          : {
              alteration: alteration.result.alteration,
              name: alteration.result.name,
            },
        showDiff
      );
    } else {
      return annotationData.result.query.alteration || '';
    }
  }

  @computed
  get alterationName() {
    return this.computeAlterationName(
      this.annotationType,
      this.alteration,
      this.alterationQuery,
      this.annotationData,
      false
    );
  }

  @computed
  get alterationNameWithDiff() {
    return this.computeAlterationName(
      this.annotationType,
      this.alteration,
      this.alterationQuery,
      this.annotationData,
      true
    );
  }

  @computed
  get oncogenicBiologicalVariants() {
    return this.biologicalAlterations.result.filter(variant =>
      isOncogenic(variant.oncogenic)
    );
  }

  @computed
  get cancerTypeName() {
    if (this.tumorTypeQuery) {
      if (this.tumorTypeQuery.toUpperCase() === this.tumorTypeQuery) {
        // we should use the cancer type name if the query is the OncoTree code.
        const matchedCancerType = this.allCancerTypes.result.filter(
          ct => ct.code === this.tumorTypeQuery
        );
        if (matchedCancerType.length === 1) {
          return getCancerTypeNameFromOncoTreeType(matchedCancerType[0]);
        }
      }
      return this.tumorTypeQuery;
    }
    return '';
  }

  @computed
  get barChartData() {
    const groupedCanerTypeCounts = groupBy(
      this.mutationMapperDataPortal.result,
      'cancerType'
    );
    const cancerGroups = keyBy(
      this.portalAlterationSampleCount.result.sort((a, b) =>
        a.count > b.count ? -1 : 1
      ),
      'cancerType'
    );
    return Object.keys(groupedCanerTypeCounts)
      .reduce((acc, cancerType) => {
        const data: PortalAlteration[] = groupedCanerTypeCounts[cancerType];
        const numUniqSampleCountsInCancerType = uniq(
          data.map(item => item.sampleId)
        ).length;
        if (cancerGroups[cancerType] && cancerGroups[cancerType].count > 50) {
          acc.push({
            x: cancerType,
            y:
              (100 * numUniqSampleCountsInCancerType) /
              cancerGroups[cancerType].count,
            alterations: data,
            overlay: '',
          } as BarChartDatum);
        }
        return acc;
      }, [] as BarChartDatum[])
      .sort((a, b) => (a.y > b.y ? -1 : 1))
      .splice(0, 15);
  }

  @computed
  get uniqOncogenicity() {
    return this.calculateOncogenicities(this.biologicalAlterations.result);
  }

  @computed
  get uniqPathogenicity() {
    return this.calculatePathogenicities(this.biologicalAlterations.result);
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
    const uniqSet: Set<string> = new Set();
    this.filteredBarChartData.forEach(data =>
      data.alterations.forEach(alteration =>
        uniqSet.add(alteration.proteinChange)
      )
    );
    return uniqSet;
  }

  @computed
  get filteredPositionsByBarChart() {
    const uniqSet: Set<number> = new Set();
    this.filteredBarChartData.forEach(data =>
      data.alterations.forEach(alteration =>
        uniqSet.add(alteration.proteinStartPosition)
      )
    );
    return uniqSet;
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
          (intersection(
            this.selectedCancerTypes,
            alteration.cancerTypes.map(cancerType => cancerType.mainType)
          ).length === 0 ||
            !this.filteredAlterationsByBarChart.has(
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
          !this.filteredAlterationsByBarChart.has(alteration.variant.alteration)
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
  get genomicIndicatorsAssociatedWithVariant() {
    if (this.annotationResult.isPending || this.genomicIndicators.isPending) {
      return [];
    }

    const variantGIStrings = this.annotationResult.result.germline
      .genomicIndicators;
    const allGeneGIEvidences = this.genomicIndicators.result;
    return allGeneGIEvidences.filter(evidence => {
      return variantGIStrings.includes(evidence.name);
    });
  }

  destroy() {
    for (const reaction of this.reactions) {
      reaction();
    }
  }
}
