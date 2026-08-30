import React from 'react';
import classnames from 'classnames';
import 'app/components/oncokbTable/filter-icon-modal.scss';

export const FilterIcon = ({ isActiveFilter }: { isActiveFilter: boolean }) => {
  // The square hover box lives on the wrapper: font-awesome's own `.fa` rule
  // sets display and line-height on the icon itself and would win over the
  // centering declared here.
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
