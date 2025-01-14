import React from 'react';

export type IFormTextAreaProps = {
  id?: string;
  onTextAreaChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  value?: string;
  boldLabel?: boolean;
  rows?: number;
  readOnly?: boolean;
};

export const FormTextAreaField: React.FunctionComponent<IFormTextAreaProps> = props => {
  return (
    <div className="form-group">
      <label
        htmlFor={props.id}
        className={props.boldLabel ? 'form-label font-weight-bold' : ''}
      >
        {props.label}
      </label>
      <textarea
        id={props.id}
        onChange={props.onTextAreaChange}
        style={props.style || { minHeight: '50px' }}
        className="form-control"
        disabled={props.disabled || false}
        defaultValue={props.value}
        rows={props.rows}
        readOnly={props.readOnly}
      />
    </div>
  );
};
