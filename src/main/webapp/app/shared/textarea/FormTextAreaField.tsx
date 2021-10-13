import React from 'react';

export type IFormTextAreaProps = {
  onTextAreaChange: (event: any) => void;
  label: string;
  style?: React.CSSProperties;
};

export const FormTextAreaField: React.FunctionComponent<IFormTextAreaProps> = props => {
  return (
    <div className="form-group">
      <label className="form-label">{props.label}</label>
      <textarea
        onChange={props.onTextAreaChange}
        style={props.style || { minHeight: '50px' }}
        className="form-control"
      ></textarea>
    </div>
  );
};
