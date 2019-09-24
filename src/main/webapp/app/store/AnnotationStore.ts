import { remoteData } from 'cbioportal-frontend-commons';
import apiClient from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { observable, computed } from 'mobx';
import { Alteration, Evidence, IndicatorQueryResp, VariantSearchQuery, Gene } from 'app/shared/api/generated/OncoKbAPI';
import { EVIDENCE_TYPES } from 'app/config/constants';
import {
  BiologicalVariant,
  CancerTypeCount,
  ClinicalVariant,
  GeneNumber,
  PortalAlteration
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import _ from 'lodash';
import { BarChartDatum } from 'app/components/barChart/BarChart';

interface IAnnotationStore {
  hugoSymbol: string;
  alteration: string;
}

const getRequestParams = (hugoSymbol: string, alteration: string) => {
  const params = {};
  if (hugoSymbol) {
    params['hugoSymbol'] = hugoSymbol;
  }
  if (hugoSymbol) {
    params['variant'] = alteration;
  }
  return params;
};

export class AnnotationStore {
  @observable hugoSymbol: string;
  @observable alteration: string;
  @observable alterationsQuery: VariantSearchQuery[] = [];

  constructor(props: IAnnotationStore) {
    this.hugoSymbol = props.hugoSymbol;
    this.alteration = props.alteration;
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
      gene: {} as Gene,
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
