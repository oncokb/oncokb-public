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

export const FormSelectWithLabelField: React.FunctionComponent<IFormSelectWithLabelProps> = props => {
  return (
    <div className="form-group">
      <label
        className={props.boldLabel ? 'font-weight-bold' : ''}
        htmlFor={props.name}
      >
        {props.labelText}
      </label>
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
