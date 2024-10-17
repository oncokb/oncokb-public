import React from 'react';
import Select from 'react-select';

export type IFormSelectWithLabelProps<Label, Value> = {
  onSelection: (selectedOption: { label: Label; value: Value }) => void;
  labelText: string;
  name: string;
  defaultValue?: { label: Label; value: Value };
  options: { label: Label; value: Value }[];
  boldLabel?: boolean;
  isClearable?: boolean;
  value?: { label: Label; value: Value } | null;
};

export type Option = {
  label: string;
  value: string;
};

export default function FormSelectWithLabelField<Label, Value>(
  props: IFormSelectWithLabelProps<Label, Value>
) {
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
}
