import { GenomeNexusAPI } from 'cbioportal-frontend-commons';

import { IEnsemblGene } from '../../../server/src/model/EnsemblGene';
import { getGenomeNexusClient } from './ApiClientUtils';

export function fetchEnsemblGene(hugoSymbol: string, client: GenomeNexusAPI = getGenomeNexusClient()): Promise<IEnsemblGene> {
  return client.fetchCanonicalEnsemblGeneIdByHugoSymbolGET({ hugoSymbol });
}
