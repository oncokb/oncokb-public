import { MutationMapperProps, MutationMapper } from 'react-mutation-mapper';
import { observer } from 'mobx-react';
import React from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import { oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';
import { observable, action } from 'mobx';
import _ from 'lodash';
import autobind from 'autobind-decorator';
import styles from './oncokbMutationMapper.module.scss';

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
        acc[oncogenicity.oncogenicity] = false;
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
        {this.props.oncogenicities.map(oncogenicity => (
          <div className="mb-2" key={oncogenicity.oncogenicity}>
            <span
              className={this.oncogenicityFilterStatus[oncogenicity.oncogenicity] ? styles.activeBadge : styles.badge}
              onClick={() => this.onToggleFilter(oncogenicity.oncogenicity)}
            >
              {oncogenicity.counts}
            </span>
            <span>{oncogenicity.oncogenicity}</span>
          </div>
        ))}
      </div>
    );
  }
}
