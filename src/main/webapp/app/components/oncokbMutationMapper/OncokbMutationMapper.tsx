import { MutationMapperProps, MutationMapper } from 'react-mutation-mapper';
import { observer } from 'mobx-react';
import React from 'react';
import { Form } from 'react-bootstrap';

export type filter = {
  name: string;
  isSelected: boolean;
};

export interface IOncokbMutationMapperProps extends MutationMapperProps {
  onInit?: (mutationMapper: OncokbMutationMapper) => void;
  filters?: filter[];
  onFilterChange?: (oncogenicity: string) => void;
  percentChecked?: boolean;
  onScaleToggle?: (checked: boolean) => void;
}

@observer
export class OncokbMutationMapper extends MutationMapper<IOncokbMutationMapperProps> {
  protected get geneSummary(): JSX.Element | null {
    return null;
  }

  protected get mutationTable(): JSX.Element | null {
    return null;
  }
  protected get mutationFilterPanel(): JSX.Element | null {
    return (
      <>
        {this.props.filters
          ? this.props.filters.map(filter => (
              <Form.Check
                key={filter.name}
                type="checkbox"
                label={filter.name}
                checked={filter.isSelected}
                onChange={() => this.props.onFilterChange!(filter.name)}
              />
            ))
          : null}
      </>
    );
  }
}
