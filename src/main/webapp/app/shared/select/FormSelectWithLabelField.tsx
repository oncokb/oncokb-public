import React from 'react';
import Select from 'react-select';

export type IFormSelectWithLabelProps = {
  onSelection: (selectedOption: any) => void;
  labelText: string;
  name: string;
  defaultValue: { value: string; label: string };
  options: { value: string; label: string }[];
};

export const FormSelectWithLabelField: React.FunctionComponent<IFormSelectWithLabelProps> = props => {
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.labelText}</label>
      <Select
        name={props.name}
        defaultValue={props.defaultValue}
        options={props.options}
        onChange={props.onSelection}
      />
    </div>
  );
};
