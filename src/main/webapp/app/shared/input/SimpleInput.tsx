import React, { useState, useEffect } from 'react';
type IDatePicker = {
  id: string;
  name?: string;
  label: string;
  value: string | string[] | number | undefined;
  onChange?: (date: string) => void;
  type: string;
  boldLabel: boolean;
};
export default function SimpleInput({
  id,
  name = id,
  label,
  onChange,
  value,
  type,
  boldLabel,
}: IDatePicker) {
  const [internalValue, setInternalValue] = useState(value);
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  return (
    <div className="form-group">
      <label htmlFor="activation">
        <span className={boldLabel ? 'font-weight-bold' : undefined}>
          {label}
        </span>
      </label>
      {type !== 'text-area' ? (
        <input
          id={id}
          name={name}
          type={type}
          value={internalValue ?? ''}
          className="form-control"
          onChange={e => {
            setInternalValue(e.target.value);
            onChange?.(e.target.value);
          }}
        />
      ) : (
        <textarea
          id={id}
          name={name}
          value={internalValue ?? ''}
          className="form-control"
          onChange={e => {
            setInternalValue(e.target.value);
            onChange?.(e.target.value);
          }}
        />
      )}
    </div>
  );
}
