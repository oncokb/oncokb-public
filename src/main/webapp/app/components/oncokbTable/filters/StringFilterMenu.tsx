import React, { useEffect, useMemo, useState } from 'react';
import { Input, Button, Label } from 'reactstrap';
import { STRING_OPERATORS, StringOperator, applyStringOperator } from './types';

export interface StringFilterMenuProps {
  id: string;
  currSelections: Set<string>;
  allSelections: Set<string>;
  updateSelections: (selected: Set<string>) => void;
}

export const StringFilterMenu: React.FunctionComponent<StringFilterMenuProps> = ({
  id,
  currSelections,
  allSelections,
  updateSelections,
}: StringFilterMenuProps) => {
  const [filterTextInput, setFilterTextInput] = useState('');
  const [filterOperator, setFilterOperator] = useState<StringOperator>(
    STRING_OPERATORS.contains
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // The visible selections change with the operator or the keyword, so a
    // previous selection no longer matches what is shown.
    if (isMounted) {
      updateSelections(new Set());
    } else {
      setIsMounted(true);
    }
  }, [filterTextInput, filterOperator]);

  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOperator(STRING_OPERATORS[e.target.value]);
  };

  const stringOperatorsDropdown = (
    <select
      className="form-control input-sm"
      value={filterOperator.id}
      onChange={handleOperatorChange}
    >
      {Object.values(STRING_OPERATORS).map(({ id: operatorId, label }) => (
        <option key={operatorId} value={operatorId}>
          {label}
        </option>
      ))}
    </select>
  );

  const handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterTextInput(e.target.value);
  };

  const handleCheckboxChange = (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    const updated = new Set(currSelections);
    if (event.target.checked) {
      updated.add(value);
    } else {
      updated.delete(value);
    }
    updateSelections(updated);
  };

  const filteredSelections = useMemo(() => {
    if (!allSelections) {
      return [];
    }
    return [...allSelections].filter(item =>
      applyStringOperator(item, filterTextInput, filterOperator)
    );
  }, [allSelections, filterTextInput, filterOperator]);

  const isEverythingSelected =
    filteredSelections.length > 0 &&
    filteredSelections.every(selection => currSelections.has(selection));

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.target.checked) {
      updateSelections(new Set(filteredSelections));
    } else {
      updateSelections(new Set());
    }
  };

  const checkboxStyle = {
    cursor: 'pointer',
    position: 'static' as const,
    marginLeft: 0,
  };

  return (
    <div>
      <div className="d-flex">
        <div style={{ width: '150px' }}>{stringOperatorsDropdown}</div>
        <div style={{ width: '200px', marginLeft: '0.5rem' }}>
          <Input value={filterTextInput} onChange={handleFilterTextChange} />
        </div>
      </div>
      <div style={{ marginTop: '10px' }}>
        <div className="checkbox-list">
          <div style={{ display: 'flex', margin: '2px' }}>
            <Input
              id={`${id}-select-all`}
              type="checkbox"
              checked={isEverythingSelected}
              onChange={handleSelectAll}
              style={checkboxStyle}
            />
            <Label for={`${id}-select-all`} style={{ cursor: 'pointer' }}>
              {isEverythingSelected ? 'Deselect all' : 'Select all'} (
              {filteredSelections.length})
            </Label>
          </div>
          {filteredSelections.map((selection, index) => {
            const htmlFor = `string-filter-selection-${id}-${index}`;
            return (
              <div key={selection} style={{ display: 'flex', margin: '2px' }}>
                <Input
                  id={htmlFor}
                  type="checkbox"
                  checked={currSelections.has(selection)}
                  onChange={e => handleCheckboxChange(selection, e)}
                  style={checkboxStyle}
                />
                <Label for={htmlFor} style={{ cursor: 'pointer' }}>
                  {selection}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
      <div className="d-flex justify-content-end mt-2">
        <Button
          color="secondary"
          size="sm"
          onClick={() => {
            updateSelections(new Set());
          }}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
};
