import React from 'react';
import InfoIcon from '../icons/InfoIcon';
import { AvField } from 'availity-reactstrap-validation';

// references
// https://github.com/Availity/availity-reactstrap-validation/blob/master/src/AvField.js
// https://github.com/Availity/availity-reactstrap-validation/tree/master/docs/lib/examples

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
  validate?: Record<string, unknown>;
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
  validate,
}: FormInputFieldProps) {
  return (
    <AvField
      id={id}
      label={
        <>
          {label}
          {infoIconOverlay && (
            <InfoIcon className="ml-2" overlay={infoIconOverlay} />
          )}
        </>
      }
      labelClass={boldLabel ? 'form-label font-weight-bold' : ''}
      name={id}
      onChange={onChange}
      style={style}
      className="form-control"
      disabled={disabled ?? false}
      value={value}
      type={type}
      validate={validate}
    />
  );
}
