import React from 'react';
import { Button } from 'reactstrap';
import classnames from 'classnames';
import {
  DX_LEVELS,
  FDA_LEVELS,
  LEVEL_BUTTON_DESCRIPTION,
  LEVELS,
  PAGE_ROUTE,
  PX_LEVELS,
} from 'app/config/constants';
import {
  FdaLevelIcon,
  isFdaLevel,
  OncoKBLevelIcon,
} from 'app/shared/utils/Utils';

export interface LevelFilterMenuProps {
  id: string;
  currSelections: Set<LEVELS>;
  allSelections: Set<LEVELS>;
  availableSelections?: Set<LEVELS>;
  updateSelections: (selected: Set<LEVELS>) => void;
}

type LevelFilterGroup = {
  key: string;
  title: string;
  levels: LEVELS[];
};

const LEVEL_FILTER_GROUPS: LevelFilterGroup[] = [
  {
    key: 'sensitivity',
    title: 'Therapeutic: Sensitivity Levels',
    levels: [
      LEVELS.Tx1,
      LEVELS.Tx2,
      LEVELS.Tx3,
      LEVELS.Tx3A,
      LEVELS.Tx3B,
      LEVELS.Tx4,
    ],
  },
  {
    key: 'resistance',
    title: 'Therapeutic: Resistance Levels',
    levels: [LEVELS.R1, LEVELS.R2],
  },
  {
    key: 'diagnostic',
    title: 'Diagnostic',
    levels: DX_LEVELS,
  },
  {
    key: 'prognostic',
    title: 'Prognostic',
    levels: PX_LEVELS,
  },
  {
    key: 'fda',
    title: 'FDA Level of Evidence',
    levels: FDA_LEVELS,
  },
];

const LEVEL_3_SUBVERSIONS = [LEVELS.Tx3A, LEVELS.Tx3B];

function getDisplayedLevels(levels: LEVELS[], allSelections: Set<LEVELS>) {
  const usesSubversions = LEVEL_3_SUBVERSIONS.some(level =>
    allSelections.has(level)
  );
  return levels.filter(level =>
    level === LEVELS.Tx3
      ? !usesSubversions
      : !LEVEL_3_SUBVERSIONS.includes(level) || usesSubversions
  );
}

export const getLevelLabel = (level: LEVELS) =>
  isFdaLevel(level)
    ? `FDA Level ${level.replace('Fda', '')}`
    : `Level ${level}`;

const LevelIcon = ({ level }: { level: LEVELS }) =>
  isFdaLevel(level) ? (
    <FdaLevelIcon level={level} withDescription={false} />
  ) : (
    <OncoKBLevelIcon level={level} withDescription={false} />
  );

export const LevelFilterMenu: React.FunctionComponent<LevelFilterMenuProps> = ({
  id,
  currSelections,
  allSelections,
  availableSelections = allSelections,
  updateSelections,
}: LevelFilterMenuProps) => {
  const isSelectable = (level: LEVELS) =>
    availableSelections.has(level) || currSelections.has(level);
  const groups = LEVEL_FILTER_GROUPS.map(group => {
    const levels = getDisplayedLevels(group.levels, allSelections);
    return {
      ...group,
      levels,
      selectableLevels: levels.filter(isSelectable),
      hasData: levels.some(level => allSelections.has(level)),
    };
  });
  const orderedGroups = [
    ...groups.filter(group => group.hasData),
    ...groups.filter(group => !group.hasData),
  ];

  const setLevels = (levels: LEVELS[], selected: boolean) => {
    const updated = new Set(currSelections);
    levels.forEach(level =>
      selected ? updated.add(level) : updated.delete(level)
    );
    updateSelections(updated);
  };

  return (
    <div className="level-filter-menu">
      <p className="level-filter-intro">
        Level of Evidence{' '}
        <a href={PAGE_ROUTE.LEVELS} target="_blank" rel="noopener noreferrer">
          Learn more <i className="fa fa-external-link" />
        </a>
      </p>
      <div className="level-filter-groups">
        {orderedGroups.map(group => {
          const selectedCount = group.selectableLevels.filter(level =>
            currSelections.has(level)
          ).length;
          const isGroupDisabled = group.selectableLevels.length === 0;
          const allSelected =
            !isGroupDisabled && selectedCount === group.selectableLevels.length;
          const groupInputId = `${id}-level-group-${group.key}`;
          return (
            <div
              key={group.key}
              className={classnames('level-filter-group', {
                'level-filter-disabled': isGroupDisabled,
              })}
            >
              <div className="level-filter-group-header">
                <input
                  id={groupInputId}
                  type="checkbox"
                  checked={allSelected}
                  disabled={isGroupDisabled}
                  ref={input => {
                    if (input) {
                      input.indeterminate = selectedCount > 0 && !allSelected;
                    }
                  }}
                  onChange={e =>
                    setLevels(group.selectableLevels, e.target.checked)
                  }
                />
                <label htmlFor={groupInputId}>
                  <span className="level-filter-group-title">
                    {group.title}
                  </span>
                </label>
              </div>
              {group.levels.map(level => {
                const inputId = `${id}-level-${level}`;
                const isSelected = currSelections.has(level);
                const isDisabled = !isSelectable(level);
                return (
                  <div
                    key={level}
                    className={classnames('level-filter-option', {
                      'level-filter-option-selected': isSelected,
                      'level-filter-disabled': isDisabled,
                    })}
                    title={
                      isDisabled
                        ? allSelections.has(level)
                          ? 'No rows with this level match the other filters'
                          : 'No rows have this level'
                        : undefined
                    }
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={e => setLevels([level], e.target.checked)}
                    />
                    <label htmlFor={inputId}>
                      <span className="level-filter-option-icon">
                        <LevelIcon level={level} />
                      </span>
                      <span className="level-filter-option-text">
                        <span className="level-filter-option-label">
                          {getLevelLabel(level)}
                        </span>
                        <span className="level-filter-option-description">
                          {LEVEL_BUTTON_DESCRIPTION[level]}
                        </span>
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="d-flex align-items-center justify-content-between mt-2">
        <span className="text-muted">
          {currSelections.size === 0
            ? 'Showing all levels'
            : `${currSelections.size} selected`}
        </span>
        <Button
          color="secondary"
          size="sm"
          disabled={currSelections.size === 0}
          onClick={() => updateSelections(new Set())}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
};
