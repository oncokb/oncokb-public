import React from 'react';
import classnames from 'classnames';
import 'app/components/oncokbTable/filter-icon-modal.scss';

export const FilterIcon = ({ isActiveFilter }: { isActiveFilter: boolean }) => {
  return (
    <span
      className={classnames('filter-icon', {
        'filter-icon-active': isActiveFilter,
      })}
    >
      <i className="fa fa-filter" />
    </span>
  );
};
