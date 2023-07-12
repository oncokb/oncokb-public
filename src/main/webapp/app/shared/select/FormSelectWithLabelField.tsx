import React from 'react';
import Select from 'react-select';

export type IFormSelectWithLabelProps = {
  onSelection: (selectedOption: any) => void;
  labelText: string;
  name: string;
  defaultValue?: { value: any; label: any };
  options: { value: any; label: any }[];
  boldLabel?: boolean;
  isClearable?: boolean;
  value?: { value: any; label: any } | null;
};

export type Option = {
  label: string;
  value: string;
};

export const FormSelectWithLabelField: React.FunctionComponent<IFormSelectWithLabelProps> = props => {
  return (
    <div className="form-group">
      <div className={`mb-2 ${props.boldLabel ? 'font-weight-bold' : ''}`}>
        {props.labelText}
      </div>
      <Select
        name={props.name}
        defaultValue={props.defaultValue}
        options={props.options}
        onChange={props.onSelection}
        isClearable={props.isClearable}
        value={props.value}
      />
    </div>
  );
};
