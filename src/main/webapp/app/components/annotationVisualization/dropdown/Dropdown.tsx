import React, { useState, useRef } from 'react';
import './Dropdown.scss';
import { ColumnOption } from '../config/constants';

interface DropdownProps {
  options: ColumnOption[];
  selectedOptions: string[];
  onChange: (selectedOptions: ColumnOption[]) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedOptions,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (option: ColumnOption) => {
    const newSelectedOptions = selectedOptions.includes(option.value)
      ? selectedOptions.filter((item: string) => item !== option.value)
      : [...selectedOptions, option.value];
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    //@ts-ignore
    onChange(newSelectedOptions.map(value => ({ value })));
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="btn full-width"
        data-testid="dropdown-button"
      >
        Select Columns
      </button>
      {isOpen && (
        <div className="dropdown-menu show" data-testid="dropdown-menu">
          {options.map(option => (
            <div key={option.value} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={option.value}
                checked={selectedOptions.includes(option.value)}
                onChange={() => handleCheckboxChange(option)}
                data-testid={`checkbox`}
              />
              <label className="form-check-label" htmlFor={option.value}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
