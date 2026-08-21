import React from 'react';
import classnames from 'classnames';
import 'app/components/oncokbTable/filter-icon-modal.scss';

export const FilterIcon = ({ isActiveFilter }: { isActiveFilter: boolean }) => {
  return (
    <i
      className={classnames('fa fa-filter filter-icon', {
        'filter-icon-active': isActiveFilter,
      })}
    />
  );
};
