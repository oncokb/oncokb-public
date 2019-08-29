import { GenomeNexusAPI } from 'cbioportal-frontend-commons';

// TODO customize domain?
const genomeNexusInternalClient = new GenomeNexusAPI('https://www.genomenexus.org/');

export function getGenomeNexusClient() {
  return genomeNexusInternalClient;
}
