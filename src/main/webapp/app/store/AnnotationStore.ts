import { remoteData } from 'cbioportal-frontend-commons';
import apiClient from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { observable, computed, IReactionDisposer, reaction, action } from 'mobx';
import { Alteration, Evidence, IndicatorQueryResp, VariantSearchQuery, Gene } from 'app/shared/api/generated/OncoKbAPI';
import { DEFAULT_GENE, EVIDENCE_TYPES } from 'app/config/constants';
import {
  BiologicalVariant,
  CancerTypeCount,
  ClinicalVariant,
  GeneNumber,
  PortalAlteration
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import _ from 'lodash';
import { BarChartDatum } from 'app/components/barChart/BarChart';
import { Mutation } from 'react-mutation-mapper';
import autobind from 'autobind-decorator';
import { oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';

interface IAnnotationStore {
  hugoSymbol: string;
  alteration: string;
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

const getRequestParams = (hugoSymbol: string, alteration?: string): RequestParams => {
  const params = {};
  params['hugoSymbol'] = hugoSymbol;
  if (alteration) {
    params['variant'] = alteration;
  }
  return params;
};

export class AnnotationStore {
  @observable hugoSymbol: string;
  @observable alteration: string;
  @observable alterationsQuery: VariantSearchQuery[] = [];
  @observable oncogenicityFilterStatus: { [oncogenicity: string]: boolean } = {};

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: IAnnotationStore) {
    this.hugoSymbol = props.hugoSymbol;
    this.alteration = props.alteration;
    this.reactions.push(
      reaction(
        () => [this.uniqOncogenicity],
        ([oncogenicities]) => {
          this.oncogenicityFilterStatus = _.reduce(
            oncogenicities,
            (acc, oncogenicity) => {
              acc[oncogenicity] = false;
              return acc;
            },
            {}
          );
        },
        { fireImmediately: true }
      )
    );
  }

  readonly gene = remoteData<Gene>({
    invoke: async () => {
      const genes = await apiClient.genesLookupGetUsingGET({
        query: this.hugoSymbol
      });
      return genes[0];
    },
    default: undefined
  });

  readonly geneSummary = remoteData<string | undefined>({
    invoke: async () => {
      const evidences = await apiClient.evidencesLookupGetUsingGET({
        hugoSymbol: this.hugoSymbol,
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
        hugoSymbol: this.hugoSymbol,
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
        hugoSymbol: this.hugoSymbol
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
        hugoSymbol: this.hugoSymbol,
        variant: this.alteration,
        evidenceTypes: EVIDENCE_TYPES.MUTATION_EFFECT
      });
    },
    default: []
  });

  readonly clinicalAlterations = remoteData<ClinicalVariant[]>({
    invoke: async () => {
      return privateClient.searchVariantsClinicalGetUsingGET({
        hugoSymbol: this.hugoSymbol
      });
    },
    default: []
  });

  readonly biologicalAlterations = remoteData<BiologicalVariant[]>({
    invoke: async () => {
      return privateClient.searchVariantsBiologicalGetUsingGET({
        hugoSymbol: this.hugoSymbol
      });
    },
    default: []
  });

  readonly mutationMapperDataExternal = remoteData<Mutation[]>({
    await: () => [this.biologicalAlterations],
    invoke: () => {
      return Promise.resolve(
        this.biologicalAlterations.result.map(alteration => {
          return {
            gene: {
              hugoGeneSymbol: this.hugoSymbol
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

  readonly searchResult = remoteData<IndicatorQueryResp>({
    invoke: async () => {
      return apiClient.searchGetUsingGET(getRequestParams(this.hugoSymbol, this.alteration));
    },
    default: undefined
  });

  readonly matchedAlterationResult = remoteData<Alteration[]>({
    invoke: async () => {
      return apiClient.variantsLookupGetUsingGET(getRequestParams(this.hugoSymbol, this.alteration));
    },
    default: []
  });

  readonly portalAlterationSampleCount = remoteData<CancerTypeCount[]>({
    invoke: async () => {
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

  @autobind
  @action
  onToggleFilter(filterKey: string) {
    this.oncogenicityFilterStatus[filterKey] = !this.oncogenicityFilterStatus[filterKey];
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
    return _.uniq(this.biologicalAlterations.result.map(alteration => alteration.oncogenic));
  }

  @computed
  get oncogenicityFilters() {
    return this.uniqOncogenicity.sort(oncogenicitySortMethod).map(oncogenicity => {
      return {
        name: oncogenicity,
        isSelected: this.oncogenicityFilterStatus[oncogenicity]
      };
    });
  }

  @computed
  get filteredOncogenicities() {
    return _.reduce(
      this.oncogenicityFilterStatus,
      (acc, status, oncogenicity) => {
        if (status) {
          acc.push(oncogenicity);
        }
        return acc;
      },
      [] as string[]
    );
  }

  @computed
  get isFiltered() {
    return this.filteredOncogenicities.length > 0;
  }

  @computed
  get filteredClinicalAlterations() {
    if (this.isFiltered) {
      return this.clinicalAlterations.result.filter(alteration => this.filteredOncogenicities.includes(alteration.oncogenic));
    } else {
      return this.clinicalAlterations.result;
    }
  }

  @computed
  get filteredBiologicalAlterations() {
    if (this.isFiltered) {
      return this.biologicalAlterations.result.filter(alteration => this.filteredOncogenicities.includes(alteration.oncogenic));
    } else {
      return this.biologicalAlterations.result;
    }
  }

  destroy() {
    for (const reaction of this.reactions) {
      reaction();
    }
  }

  readonly alterationsSearchResult = remoteData<Alteration[][]>({
    invoke: async () => {
      const result = await apiClient.variantsLookupPostUsingPOST({
        body: this.alterationsQuery
      });
      return result as Alteration[][];
    },
    default: []
  });
}
