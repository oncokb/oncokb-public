import React, { useState } from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import 'app/components/oncokbTable/filter-icon-modal.scss';
import { FilterIcon } from './FilterIcon';
import { StringFilterMenu } from './StringFilterMenu';
import { NumberFilterMenu } from './NumberFilterMenu';
import { FilterTypes } from './types';
import classnames from 'classnames';

type FilterValueTypeMap = {
  [FilterTypes.STRING]: string;
  [FilterTypes.NUMBER]: number;
};

interface IFilterIconModalProps<T extends FilterTypes> {
  id: string;
  filterType: T;
  allSelections: Set<FilterValueTypeMap[T]>;
  currSelections: Set<FilterValueTypeMap[T]>;
  updateSelections: (selected: Set<FilterValueTypeMap[T]>) => void;
}

export const FilterIconModal = <T extends FilterTypes>({
  id,
  filterType,
  allSelections,
  currSelections,
  updateSelections,
}: IFilterIconModalProps<T>) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const isActiveFilter = currSelections.size > 0;

  const renderFilterMenu = (): JSX.Element | null => {
    switch (filterType) {
      case FilterTypes.STRING:
        return (
          <StringFilterMenu
            id={id}
            currSelections={currSelections as Set<string>}
            allSelections={allSelections as Set<string>}
            updateSelections={
              updateSelections as (selected: Set<string>) => void
            }
          />
        );

      case FilterTypes.NUMBER:
        return (
          <NumberFilterMenu
            id={id}
            currSelections={currSelections as Set<number>}
            allSelections={allSelections as Set<number>}
            updateSelections={
              updateSelections as (selected: Set<number>) => void
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <DefaultTooltip
      overlay={
        <div className="filter-overlay" onClick={e => e.stopPropagation()}>
          {renderFilterMenu()}
        </div>
      }
      placement="right"
      trigger={['click']}
      overlayClassName="filter-tooltip"
      arrowContent={null}
      onVisibleChange={visible => setIsMenuVisible(!!visible)}
    >
      <div
        // The icon only shows on column hover, but it has to stay put while its
        // own menu is open and whenever the column is actually filtered.
        className={classnames('filter-component', {
          'filter-component-visible': isMenuVisible || isActiveFilter,
        })}
        onClick={e => e.stopPropagation()}
      >
        <FilterIcon isActiveFilter={isActiveFilter} />
      </div>
    </DefaultTooltip>
  );
};
