import { MutationMapperProps, MutationMapper } from 'react-mutation-mapper';
import { observer } from 'mobx-react';
import React from 'react';
import { Form } from 'react-bootstrap';
import { oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';
import { observable, action } from 'mobx';
import _ from 'lodash';
import autobind from 'autobind-decorator';

export type filter = {
  name: string;
  isSelected: boolean;
};

export interface IOncokbMutationMapperProps extends MutationMapperProps {
  oncogenicities: string[];
  onFilterChange?: (oncogenicity: string) => void;
}

type TOncogenicityFilterStatus = { [oncogenicity: string]: boolean };
@observer
export class OncokbMutationMapper extends MutationMapper<IOncokbMutationMapperProps> {
  @observable oncogenicityFilterStatus: TOncogenicityFilterStatus = {};

  @autobind
  @action
  onToggleFilter(filterKey: string) {
    this.oncogenicityFilterStatus[filterKey] = !this.oncogenicityFilterStatus[filterKey];
    if (this.props.onFilterChange) {
      this.props.onFilterChange(filterKey);
    }
  }

  constructor(props: IOncokbMutationMapperProps, context: any) {
    super(props, context);
    this.oncogenicityFilterStatus = _.reduce(
      props.oncogenicities,
      (acc, oncogenicity) => {
        acc[oncogenicity] = false;
        return acc;
      },
      {} as TOncogenicityFilterStatus
    );
  }

  protected get geneSummary(): JSX.Element | null {
    return null;
  }

  protected get mutationTable(): JSX.Element | null {
    return null;
  }
  protected get mutationFilterPanel(): JSX.Element | null {
    return (
      <div>
        {this.props.oncogenicities.sort(oncogenicitySortMethod).map(oncogenicity => (
          <Form.Check
            key={oncogenicity}
            type="checkbox"
            label={oncogenicity}
            checked={this.oncogenicityFilterStatus[oncogenicity]}
            onChange={() => this.onToggleFilter(oncogenicity)}
          />
        ))}
      </div>
    );
  }
}
