import { remoteData } from 'cbioportal-frontend-commons';
import apiClient from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { observable, computed, IReactionDisposer, action } from 'mobx';
import { Evidence, Gene, Citations } from 'app/shared/api/generated/OncoKbAPI';
import { DEFAULT_GENE, EVIDENCE_TYPES, DEFAULT_ANNOTATION, TREATMENT_EVIDENCE_TYPES } from 'app/config/constants';
import {
  BiologicalVariant,
  CancerTypeCount,
  ClinicalVariant,
  GeneNumber,
  MainType,
  PortalAlteration,
  TumorType,
  VariantAnnotation
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import _ from 'lodash';
import { BarChartDatum } from 'app/components/barChart/BarChart';
import { Mutation } from 'react-mutation-mapper';
import {
  articles2Citations,
  getCancerTypeNameFromOncoTreeType,
  getTreatmentNameFromEvidence,
  levelOfEvidence2Level
} from 'app/shared/utils/Utils';
import { oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';
import { Oncogenicity } from 'app/components/oncokbMutationMapper/OncokbMutationMapper';

interface IAnnotationStore {
  hugoSymbolQuery: string;
  alterationQuery?: string;
  tumorTypeQuery?: string;
}

export type RequestParams = {
  entrezGeneId?: number;
  hugoSymbol?: string;
  variant?: string;
  variantType?: string;
  consequence?: string;
  proteinStart?: number;
  proteinEnd?: number;
  hgvs?: string;
  fields?: string;
};

const getRequestParams = (hugoSymbol: string, alteration?: string, tumorType?: string): RequestParams => {
  const params = {};
  params['hugoSymbol'] = hugoSymbol;
  if (alteration) {
    params['variant'] = alteration;
  }
  if (tumorType) {
    params['tumorType'] = tumorType;
  }
  return params;
};

export type TherapeuticImplication = {
  level: string;
  alterations: string;
  drugs: string;
  cancerTypes: string;
  citations: Citations;
};

export class AnnotationStore {
  @observable hugoSymbolQuery: string;
  @observable alterationQuery: string;
  @observable tumorTypeQuery: string;
  @observable oncogenicityFilters: string[] = [];
  @observable selectedCancerTypes: string[] = [];

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: IAnnotationStore) {
    this.hugoSymbolQuery = props.hugoSymbolQuery;
    if (props.alterationQuery) this.alterationQuery = props.alterationQuery;
    if (props.tumorTypeQuery) this.tumorTypeQuery = props.tumorTypeQuery;
  }

  readonly gene = remoteData<Gene>({
    invoke: async () => {
      const genes = await apiClient.genesLookupGetUsingGET({
        query: this.hugoSymbolQuery
      });
      return genes[0];
    },
    default: DEFAULT_GENE
  });

  // this is for easier access of the hugoSymbol from the gene call
  @computed
  get hugoSymbol() {
    return this.gene.result.hugoSymbol;
  }

  readonly geneSummary = remoteData<string | undefined>({
    invoke: async () => {
      const evidences = await apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.hugoSymbolQuery,
        evidenceTypes: EVIDENCE_TYPES.GENE_SUMMARY
      });
      if (evidences.length > 0) {
        return evidences[0].description;
      } else {
        return undefined;
      }
    }
  });

  readonly geneBackground = remoteData<string | undefined>({
    invoke: async () => {
      const evidences = await apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.hugoSymbolQuery,
        evidenceTypes: EVIDENCE_TYPES.GENE_BACKGROUND
      });
      if (evidences.length > 0) {
        return evidences[0].description;
      } else {
        return undefined;
      }
    }
  });

  readonly geneNumber = remoteData<GeneNumber>({
    invoke: async () => {
      return privateClient.utilsNumbersGeneGetUsingGET({
        hugoSymbol: this.hugoSymbolQuery
      });
    },
    default: {
      gene: DEFAULT_GENE,
      alteration: 0,
      highestSensitiveLevel: '',
      highestResistanceLevel: '',
      tumorType: 0
    }
  });

  readonly mutationEffect = remoteData<Evidence[]>({
    invoke: async () => {
      return apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.hugoSymbolQuery,
        variant: this.alterationQuery,
        evidenceTypes: EVIDENCE_TYPES.MUTATION_EFFECT
      });
    },
    default: []
  });

  readonly clinicalAlterations = remoteData<ClinicalVariant[]>({
    invoke: async () => {
      return privateClient.searchVariantsClinicalGetUsingGET({
        hugoSymbol: this.hugoSymbolQuery
      });
    },
    default: []
  });

  readonly biologicalAlterations = remoteData<BiologicalVariant[]>({
    invoke: async () => {
      return privateClient.searchVariantsBiologicalGetUsingGET({
        hugoSymbol: this.hugoSymbolQuery
      });
    },
    default: []
  });

  readonly mutationMapperDataExternal = remoteData<Mutation[]>({
    await: () => [this.biologicalAlterations],
    invoke: async () => {
      return Promise.resolve(
        this.biologicalAlterations.result.map(alteration => {
          return {
            gene: {
              hugoGeneSymbol: this.hugoSymbolQuery
            },
            proteinChange: alteration.variant.alteration,
            proteinPosEnd: alteration.variant.proteinEnd,
            proteinPosStart: alteration.variant.proteinStart,
            referenceAllele: alteration.variant.refResidues,
            variantAllele: alteration.variant.variantResidues,
            mutationType: alteration.variant.consequence.term
          };
        })
      );
    }
  });

  readonly allMainTypes = remoteData<MainType[]>({
    await: () => [],
    async invoke() {
      const result = await privateClient.utilsOncoTreeMainTypesGetUsingGET({
        excludeSpecialTumorType: true
      });
      return result.sort();
    },
    default: []
  });

  readonly allSubtype = remoteData<TumorType[]>({
    await: () => [],
    async invoke() {
      const result = await privateClient.utilsOncoTreeSubtypesGetUsingGET({});
      return result.sort();
    },
    default: []
  });

  readonly allTumorTypesOptions = remoteData<any>({
    await: () => [this.allMainTypes, this.allSubtype],
    invoke: async () => {
      return Promise.resolve([
        {
          label: 'Cancer Type',
          options: _.uniq(this.allMainTypes.result.filter(mainType => !mainType.name.endsWith('NOS')).map(mainType => mainType.name))
            .sort()
            .map(tumorType => {
              return {
                value: tumorType,
                label: tumorType
              };
            })
        },
        {
          label: 'Cancer Type Detailed',
          options: _.sortBy(this.allSubtype.result, 'name').map(tumorType => {
            return {
              value: tumorType.code,
              label: tumorType.name
            };
          })
        }
      ]);
    },
    default: []
  });

  readonly annotationResult = remoteData<VariantAnnotation>({
    invoke: async () => {
      return privateClient.utilVariantAnnotationGetUsingGET({
        hugoSymbol: this.hugoSymbolQuery,
        alteration: this.alterationQuery,
        tumorType: this.tumorTypeQuery
      });
    },
    default: DEFAULT_ANNOTATION
  });

  @computed
  get therapeuticImplications(): TherapeuticImplication[] {
    return _.reduce(
      this.annotationResult.result.tumorTypes,
      (acc, next) => {
        const oncoTreeCancerType = getCancerTypeNameFromOncoTreeType(next.tumorType);
        next.evidences.forEach(evidence => {
          if (TREATMENT_EVIDENCE_TYPES.includes(evidence.evidenceType as EVIDENCE_TYPES)) {
            const level = levelOfEvidence2Level(evidence.levelOfEvidence);
            acc.push({
              level,
              alterations: evidence.alterations.map(alteration => alteration.name).join(', '),
              drugs: getTreatmentNameFromEvidence(evidence),
              cancerTypes: oncoTreeCancerType,
              citations: articles2Citations(evidence.articles)
            });
          }
        });
        return acc;
      },
      [] as TherapeuticImplication[]
    );
  }

  readonly portalAlterationSampleCount = remoteData<CancerTypeCount[]>({
    async invoke() {
      return privateClient.utilPortalAlterationSampleCountGetUsingGET({});
    },
    default: []
  });

  readonly mutationMapperData = remoteData<PortalAlteration[]>({
    invoke: async () => {
      return privateClient.utilMutationMapperDataGetUsingGET({
        hugoSymbol: this.hugoSymbol
      });
    },
    default: []
  });

  @action.bound
  onToggleFilter(filterKey: string) {
    this.oncogenicityFilters = _.xor(this.oncogenicityFilters, [filterKey]);
  }

  @computed
  get barChartData() {
    const groupedCanerTypeCounts = _.groupBy(this.mutationMapperData.result, 'cancerType');
    const cancerGroups = _.keyBy(this.portalAlterationSampleCount.result.sort((a, b) => (a.count > b.count ? -1 : 1)), 'cancerType');
    return _.reduce(
      groupedCanerTypeCounts,
      (acc, next: PortalAlteration[], cancerType) => {
        const numUniqSampleCountsInCancerType = _.uniq(next.map(item => item.sampleId)).length;
        if (cancerGroups[cancerType] && cancerGroups[cancerType].count > 50) {
          acc.push({
            x: cancerType,
            y: (100 * numUniqSampleCountsInCancerType) / cancerGroups[cancerType].count,
            alterations: next,
            overlay: ''
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
    const oncogenicities = _.groupBy(this.biologicalAlterations.result, 'oncogenic');
    const keys = _.keys(oncogenicities).sort(oncogenicitySortMethod);
    return _.reduce(
      keys,
      (acc, oncogenicity) => {
        const datum = oncogenicities[oncogenicity];
        acc.push({
          oncogenicity,
          counts: datum.length
        });
        return acc;
      },
      [] as Oncogenicity[]
    );
  }

  @computed
  get isFiltered() {
    return this.oncogenicityFilters.length > 0 || this.selectedCancerTypes.length > 0;
  }

  @computed
  get filteredBarChartData() {
    return this.selectedCancerTypes.length === 0
      ? this.barChartData
      : this.barChartData.filter(data => this.selectedCancerTypes.includes(data.x));
  }

  @computed
  get filteredAlterationsByBarChart() {
    return _.uniq(_.flatten(this.filteredBarChartData.map(data => data.alterations.map(alteration => alteration.proteinChange))));
  }

  @computed
  get filteredClinicalAlterations() {
    if (this.isFiltered) {
      return this.clinicalAlterations.result.filter(alteration => {
        let isMatch = true;
        if (this.oncogenicityFilters.length > 0 && !this.oncogenicityFilters.includes(alteration.oncogenic)) {
          isMatch = false;
        }
        if (this.selectedCancerTypes.length > 0 && !this.filteredAlterationsByBarChart.includes(alteration.variant.alteration)) {
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
        if (this.oncogenicityFilters.length > 0 && !this.oncogenicityFilters.includes(alteration.oncogenic)) {
          isMatch = false;
        }
        if (this.selectedCancerTypes.length > 0 && !this.filteredAlterationsByBarChart.includes(alteration.variant.alteration)) {
          isMatch = false;
        }
        return isMatch;
      });
    } else {
      return this.biologicalAlterations.result;
    }
  }

  destroy() {
    for (const reaction of this.reactions) {
      reaction();
    }
  }
}
