import React from 'react';

export type IFormTextAreaProps = {
  onTextAreaChange?: (event: any) => void;
  label: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  value?: string;
  boldLabel?: boolean;
};

export const FormTextAreaField: React.FunctionComponent<IFormTextAreaProps> = props => {
  return (
    <div className="form-group">
      <label className={props.boldLabel ? 'form-label font-weight-bold' : ''}>
        {props.label}
      </label>
      <textarea
        onChange={props.onTextAreaChange}
        style={props.style || { minHeight: '50px' }}
        className="form-control"
        disabled={props.disabled || false}
        defaultValue={props.value}
      />
    </div>
  );
};
