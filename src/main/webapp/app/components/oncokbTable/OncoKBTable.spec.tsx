import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import OncoKBTable, { SearchColumn } from './OncoKBTable';
import { FilterTypes } from './filters/types';

Enzyme.configure({ adapter: new Adapter() });

type Row = { alteration: string; oncogenic: string };

const data: Row[] = [
  { alteration: 'V600E', oncogenic: 'Oncogenic' },
  { alteration: 'V1000K', oncogenic: 'Likely Oncogenic' },
  { alteration: 'D594G', oncogenic: 'Oncogenic' },
];

const columns: SearchColumn<Row>[] = [
  {
    Header: <span>Alteration</span>,
    accessor: 'alteration',
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (d: Row) => d.alteration,
  },
  {
    Header: <span>Oncogenicity</span>,
    accessor: 'oncogenic',
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (d: Row) => d.oncogenic,
  },
];

function mountTable() {
  return mount(
    <OncoKBTable data={data} columns={columns} pageSize={data.length} />
  );
}

function filterMenuLabels(wrapper: Enzyme.ReactWrapper) {
  return wrapper.find('.checkbox-list label').map(label => label.text());
}

it('filters rows through the column filter menu', () => {
  const wrapper = mountTable();
  expect(wrapper.find('.rt-tr-group').length).toEqual(3);

  // one filter icon per filterable column
  expect(wrapper.find('.filter-component').length).toEqual(2);

  wrapper.find('.filter-component').at(1).simulate('click');
  // select all + one per unique value
  expect(wrapper.find('.checkbox-list input[type="checkbox"]').length).toEqual(
    3
  );

  wrapper
    .find('.checkbox-list input[type="checkbox"]')
    .at(1)
    .simulate('change', { target: { checked: true } });
  wrapper.update();

  expect(wrapper.find('.rt-tr-group').length).toEqual(1);
  expect(wrapper.text()).toContain('Reset all filters');
  expect(wrapper.find('.filter-icon-active').length).toEqual(1);

  // selecting every remaining value flips the select all label
  wrapper
    .find('.checkbox-list input[type="checkbox"]')
    .at(2)
    .simulate('change', { target: { checked: true } });
  wrapper.update();
  expect(filterMenuLabels(wrapper)[0]).toEqual('Deselect all (2)');

  wrapper
    .findWhere(n => n.type() === 'button' && n.text() === 'Reset all filters')
    .simulate('click');
  wrapper.update();
  expect(wrapper.find('.rt-tr-group').length).toEqual(3);
});

it('lists the filter values in a stable order rather than row order', () => {
  const wrapper = mountTable();

  wrapper.find('.filter-component').at(1).simulate('click');
  expect(filterMenuLabels(wrapper)).toEqual([
    'Select all (2)',
    'Likely Oncogenic',
    'Oncogenic',
  ]);
});

it('sorts filter values naturally so embedded numbers read in order', () => {
  const wrapper = mountTable();

  wrapper.find('.filter-component').at(0).simulate('click');
  expect(filterMenuLabels(wrapper)).toEqual([
    'Select all (3)',
    'D594G',
    'V600E',
    'V1000K',
  ]);
});
