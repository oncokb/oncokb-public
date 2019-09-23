import { remoteData } from 'cbioportal-frontend-commons';
import apiClient from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { observable, computed } from 'mobx';
import { Alteration, Evidence, IndicatorQueryResp, VariantSearchQuery, Gene } from 'app/shared/api/generated/OncoKbAPI';
import { EVIDENCE_TYPES } from 'app/config/constants';
import { BiologicalVariant, ClinicalVariant, GeneNumber, PortalAlteration } from 'app/shared/api/generated/OncoKbPrivateAPI';

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
      gene: null as Gene,
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

  readonly portalAlterationSampleCount = remoteData<PortalAlteration[]>({
    invoke: async () => {
      return privateClient.utilPortalAlterationSampleCountGetUsingGET({
        hugoSymbol: this.hugoSymbol
      });
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

  readonly alterationsSearchResult = remoteData<Alteration[][]>({
    invoke: async () => {
      const result = await apiClient.variantsLookupPostUsingPOST({
        body: this.alterationsQuery
      });
      return result as Alteration[][];
    },
    default: []
  });

  @computed
  get geneIsValid() {
    return this.gene.isComplete && !!this.gene.result;
  }
}
