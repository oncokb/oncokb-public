import React from 'react';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import { prefetchRelevantCancerTypeNames } from './cancerTypeFilterUtils';

export interface CancerTypeFilterMenuProps {
  currSelections: Set<string>;
  updateSelections: (selected: Set<string>) => void;
}

export const CancerTypeFilterMenu: React.FunctionComponent<CancerTypeFilterMenuProps> = props => {
  return (
    <div style={{ width: '350px' }}>
      <CancerTypeSelect
        isMulti
        cancerTypes={Array.from(props.currSelections)}
        onChange={(selectedOptions: any) => {
          const selected = new Set(
            ((selectedOptions || []) as { value: string }[]).map(
              option => option.value
            )
          );
          prefetchRelevantCancerTypeNames(selected).then(() =>
            props.updateSelections(selected)
          );
        }}
      />
    </div>
  );
};
