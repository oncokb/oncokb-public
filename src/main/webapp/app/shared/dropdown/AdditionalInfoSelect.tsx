import React from 'react';
import Select, { components, Props as SelectProps } from 'react-select';
import _ from 'lodash';

const Option: React.FunctionComponent<any> = (props: any) => {
  return (
    <>
      <components.Option {...props}>
        <div>
          <strong>{props.data.label}</strong>
          <div>{props.data.description}</div>
        </div>
      </components.Option>
    </>
  );
};

type AdditionalInfoSelectOption = {
  label: string;
  description: string;
  value: any;
};

type IAdditionalInfoSelect = {
  options: AdditionalInfoSelectOption[];
  onSelection: (selectedOption: any) => void;
  name: string;
  defaultValue?: { label: string; value: any };
};

export const AdditionalInfoSelect: React.FunctionComponent<IAdditionalInfoSelect> = props => {
  return (
    <Select
      name={props.name}
      components={{ Option }}
      options={props.options}
      onChange={props.onSelection}
      defaultValue={props.defaultValue}
    />
  );
};
