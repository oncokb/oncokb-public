import { MutationMapperProps, MutationMapper } from 'react-mutation-mapper';
import { observer } from 'mobx-react';
import React from 'react';

export type Filter = {
  name: string;
  isSelected: boolean;
};

export type Oncogenicity = {
  oncogenicity: string;
  counts: number;
};

export interface IOncokbMutationMapperProps extends MutationMapperProps {
  oncogenicities: Oncogenicity[];
}

@observer
export class OncokbMutationMapper extends MutationMapper<
  IOncokbMutationMapperProps
> {
  protected get geneSummary(): JSX.Element | null {
    return null;
  }

  protected get mutationTable(): JSX.Element | null {
    return null;
  }
}
