import React from 'react';

export type FormInputFieldProps = {
  id: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  value?: string | string[] | number;
  boldLabel?: boolean;
  type: string;
};

export default function FormInputField({
  id,
  onChange,
  label,
  boldLabel,
  style,
  disabled,
  value,
  type,
}: FormInputFieldProps) {
  return (
    <div className="form-group">
      <label
        htmlFor={id}
        className={boldLabel ? 'form-label font-weight-bold' : ''}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        onChange={onChange}
        style={style ?? { minHeight: '50px' }}
        className="form-control"
        disabled={disabled ?? false}
        defaultValue={value}
        type={type}
      />
    </div>
  );
}
