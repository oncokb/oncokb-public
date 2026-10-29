import React, { useRef, useState } from 'react';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import 'app/components/oncokbTable/filter-icon-modal.scss';
import { FilterIcon } from './FilterIcon';
import { StringFilterMenu } from './StringFilterMenu';
import { NumberFilterMenu } from './NumberFilterMenu';
import { LevelFilterMenu } from './LevelFilterMenu';
import { CancerTypeFilterMenu } from './CancerTypeFilterMenu';
import { FilterTypes, isActiveColumnFilter } from './types';
import classnames from 'classnames';
import { LEVELS } from 'app/config/constants';

type FilterValueTypeMap = {
  [FilterTypes.STRING]: string;
  [FilterTypes.NUMBER]: number;
  [FilterTypes.LEVEL]: LEVELS;
  [FilterTypes.CANCER_TYPE]: string;
};

interface IFilterIconModalProps<T extends FilterTypes> {
  id: string;
  filterType: T;
  allSelections: Set<FilterValueTypeMap[T]>;
  availableSelections?: Set<FilterValueTypeMap[T]>;
  // undefined means no filter is set for this column.
  currSelections: Set<FilterValueTypeMap[T]> | undefined;
  updateSelections: (selected: Set<FilterValueTypeMap[T]> | undefined) => void;
}

export const FilterIconModal = <T extends FilterTypes>({
  id,
  filterType,
  allSelections,
  availableSelections,
  currSelections,
  updateSelections,
}: IFilterIconModalProps<T>) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const isMouseDownInOverlay = useRef(false);
  const isActiveFilter = isActiveColumnFilter(filterType, currSelections);
  const checkboxSelections = currSelections || new Set();

  const renderFilterMenu = (): JSX.Element | null => {
    switch (filterType) {
      case FilterTypes.STRING:
        return (
          <StringFilterMenu
            id={id}
            currSelections={checkboxSelections as Set<string>}
            allSelections={allSelections as Set<string>}
            updateSelections={
              updateSelections as (selected: Set<string>) => void
            }
          />
        );

      case FilterTypes.CANCER_TYPE:
        return (
          <CancerTypeFilterMenu
            currSelections={checkboxSelections as Set<string>}
            updateSelections={
              updateSelections as (selected: Set<string>) => void
            }
          />
        );

      case FilterTypes.NUMBER:
        return (
          <NumberFilterMenu
            id={id}
            currSelections={currSelections as Set<number> | undefined}
            allSelections={allSelections as Set<number>}
            updateSelections={
              updateSelections as (selected: Set<number> | undefined) => void
            }
          />
        );

      case FilterTypes.LEVEL:
        return (
          <LevelFilterMenu
            id={id}
            currSelections={checkboxSelections as Set<LEVELS>}
            allSelections={allSelections as Set<LEVELS>}
            availableSelections={availableSelections as Set<LEVELS> | undefined}
            updateSelections={
              updateSelections as (selected: Set<LEVELS>) => void
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
        <div
          className="filter-overlay"
          onClick={e => e.stopPropagation()}
          onMouseDownCapture={() => {
            isMouseDownInOverlay.current = true;
            setTimeout(() => (isMouseDownInOverlay.current = false), 0);
          }}
        >
          {renderFilterMenu()}
        </div>
      }
      placement="right"
      trigger={['click']}
      overlayClassName="filter-tooltip"
      arrowContent={null}
      visible={isMenuVisible}
      onVisibleChange={visible => {
        if (!visible && isMouseDownInOverlay.current) {
          return;
        }
        setIsMenuVisible(!!visible);
      }}
    >
      <div
        className={classnames('filter-component', {
          'filter-component-visible': isMenuVisible || isActiveFilter,
          'filter-component-open': isMenuVisible,
        })}
        onClick={e => e.stopPropagation()}
      >
        <FilterIcon isActiveFilter={isActiveFilter} />
      </div>
    </DefaultTooltip>
  );
};
