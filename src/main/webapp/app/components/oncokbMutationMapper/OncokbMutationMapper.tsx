import {MutationMapperProps, MutationMapper, onFilterOptionSelect} from 'react-mutation-mapper';
import { observer } from 'mobx-react';
import React from 'react';
import {action, computed} from 'mobx';
import _ from 'lodash';
import OncogenicityBadgeSelector from "app/components/oncokbMutationMapper/OncogenicityBadgeSelector";
import {
  findOncogenicityFilter,
  ONCOGENICITY_FILTER_ID,
  ONCOGENICITY_FILTER_TYPE
} from "app/components/oncokbMutationMapper/FilterUtils";

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
export class OncokbMutationMapper extends MutationMapper<IOncokbMutationMapperProps> {
  @computed
  public get oncogenicityFilter() {
    return findOncogenicityFilter(this.store.dataStore.dataFilters);
  }

  @computed
  public get oncogenictyCounts() {
    return _.reduce(
      this.props.oncogenicities,
      (acc, oncogenicity) => {
        acc[oncogenicity.oncogenicity] = oncogenicity.counts;
        return acc;
      },
      {}
    );
  }

  @action.bound
  protected onToggleFilter(selectedOncogenicityIds: string[], allValuesSelected: boolean)
  {
    onFilterOptionSelect(
      selectedOncogenicityIds,
      allValuesSelected,
      this.store.dataStore,
      ONCOGENICITY_FILTER_TYPE,
      ONCOGENICITY_FILTER_ID);
  }

  protected get geneSummary(): JSX.Element | null {
    return null;
  }

  protected get mutationTable(): JSX.Element | null {
    return null;
  }

  protected get mutationFilterPanel(): JSX.Element | null {
    return (
      <OncogenicityBadgeSelector
        filter={this.oncogenicityFilter}
        oncogenicities={this.props.oncogenicities}
        counts={this.oncogenictyCounts}
        onSelect={this.onToggleFilter}
      />
    );
  }
}
