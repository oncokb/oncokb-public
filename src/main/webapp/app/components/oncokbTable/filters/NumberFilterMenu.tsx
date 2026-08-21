import React, { useMemo, useState } from 'react';
import { applyNumberOperator, NUMBER_OPERATORS, NumberOperator } from './types';
import { Button, Input } from 'reactstrap';

export type NumberRange = [number | null, number | null];

export interface NumberFilterMenuProps {
  id: string;
  currSelections: Set<number>;
  allSelections: Set<number>;
  updateSelections: (selected: Set<number>) => void;
}

export const NumberFilterMenu: React.FunctionComponent<NumberFilterMenuProps> = ({
  allSelections,
  updateSelections,
}) => {
  const [filterRange, setFilterRange] = useState<NumberRange>([null, null]);
  const [filterOperator, setFilterOperator] = useState<NumberOperator>(
    NUMBER_OPERATORS.between
  );

  const [minValue, maxValue] = useMemo(() => {
    const allSelectionsArray = Array.from(allSelections);
    let min = allSelectionsArray[0];
    let max = allSelectionsArray[0];

    for (let i = 1; i < allSelectionsArray.length; i++) {
      const num = allSelectionsArray[i];
      if (num < min) min = num;
      if (num > max) max = num;
    }

    return [min, max];
  }, [allSelections]);

  const applyRange = (range: NumberRange, operator: NumberOperator) => {
    const newSelections = new Set<number>();
    for (const val of allSelections) {
      if (applyNumberOperator(val, range, operator)) {
        newSelections.add(val);
      }
    }
    updateSelections(newSelections);
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const operator = NUMBER_OPERATORS[e.target.value];
    setFilterOperator(operator);

    // Reset filter range on operator change
    setFilterRange([null, null]);
    updateSelections(new Set());
  };

  const handleInputChange = (index: 0 | 1) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.trim();
    const num = value === '' ? null : parseFloat(value);
    const updatedRange: NumberRange = [...filterRange] as NumberRange;
    updatedRange[index] = num === null || isNaN(num) ? null : num;

    setFilterRange(updatedRange);
    applyRange(updatedRange, filterOperator);
  };

  const handleResetFilter = () => {
    const resetRange: NumberRange = [null, null];
    setFilterRange(resetRange);
    updateSelections(new Set());
  };

  const numberOperatorsDropdown = (
    <select
      className="form-control input-sm"
      value={filterOperator.id}
      onChange={handleOperatorChange}
    >
      {Object.values(NUMBER_OPERATORS).map(({ id: operatorId, label }) => (
        <option key={operatorId} value={operatorId}>
          {label}
        </option>
      ))}
    </select>
  );

  const renderInputs = () => {
    if (filterOperator.id === 'between') {
      return (
        <>
          <Input
            placeholder={`Min (${minValue})`}
            value={filterRange[0] ?? ''}
            onChange={handleInputChange(0)}
            type="number"
            className="mr-2"
            min={minValue}
            max={maxValue}
          />
          <Input
            placeholder={`Max (${maxValue})`}
            value={filterRange[1] ?? ''}
            onChange={handleInputChange(1)}
            type="number"
            min={minValue}
            max={maxValue}
          />
        </>
      );
    } else {
      return (
        <Input
          placeholder="Value"
          value={filterRange[0] ?? ''}
          onChange={handleInputChange(0)}
          type="number"
        />
      );
    }
  };

  return (
    <div>
      <div style={{ width: '200px' }}>{numberOperatorsDropdown}</div>
      <div
        style={{ width: '200px', display: 'flex', gap: '0.5rem' }}
        className="mt-2"
      >
        {renderInputs()}
      </div>
      <div className="d-flex justify-content-end mt-2">
        <Button color="secondary" size="sm" onClick={handleResetFilter}>
          Clear filters
        </Button>
      </div>
    </div>
  );
};
