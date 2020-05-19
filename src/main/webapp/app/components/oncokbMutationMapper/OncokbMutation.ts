import { Mutation } from 'cbioportal-utils';

export type OncokbMutation = Mutation & {
  oncogenic: string;
  cancerType?: string;
};
