import React from 'react';
import InfoIcon from '../icons/InfoIcon';

export type FormInputFieldProps = {
  id: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  value?: string | string[] | number;
  boldLabel?: boolean;
  infoIconOverlay?: Parameters<typeof InfoIcon>[0]['overlay'];
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
  infoIconOverlay,
}: FormInputFieldProps) {
  return (
    <div className="form-group">
      <label
        htmlFor={id}
        className={boldLabel ? 'form-label font-weight-bold' : ''}
      >
        {label}
      </label>
      {infoIconOverlay && (
        <InfoIcon className="ml-2" overlay={infoIconOverlay} />
      )}
      <input
        id={id}
        name={id}
        onChange={onChange}
        style={style}
        className="form-control"
        disabled={disabled ?? false}
        defaultValue={value}
        type={type}
      />
    </div>
  );
}
