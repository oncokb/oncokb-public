import { Mutation } from 'react-mutation-mapper';

export type OncokbMutation = Mutation & {
  oncogenic: string;
  cancerType?: string;
};
