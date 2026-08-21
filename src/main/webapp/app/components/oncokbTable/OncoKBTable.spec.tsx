import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import OncoKBTable, { SearchColumn } from './OncoKBTable';
import { FilterTypes } from './filters/types';

Enzyme.configure({ adapter: new Adapter() });

type Row = { alteration: string; oncogenic: string };

const data: Row[] = [
  { alteration: 'V600E', oncogenic: 'Oncogenic' },
  { alteration: 'V600K', oncogenic: 'Likely Oncogenic' },
  { alteration: 'D594G', oncogenic: 'Oncogenic' },
];

const columns: SearchColumn<Row>[] = [
  { Header: <span>Alteration</span>, accessor: 'alteration' },
  {
    Header: <span>Oncogenicity</span>,
    accessor: 'oncogenic',
    filterType: FilterTypes.STRING,
    getColumnFilterValue: (d: Row) => d.oncogenic,
  },
];

it('filters rows through the column filter menu', () => {
  const wrapper = mount(
    <OncoKBTable data={data} columns={columns} pageSize={data.length} />
  );
  expect(wrapper.find('.rt-tr-group').length).toEqual(3);

  // one filter icon, on the filterable column only
  expect(wrapper.find('.filter-component').length).toEqual(1);

  wrapper.find('.filter-component').simulate('click');
  const checkboxes = wrapper.find('.checkbox-list input[type="checkbox"]');
  // select all + one per unique value
  expect(checkboxes.length).toEqual(3);

  const labels = wrapper.find('.checkbox-list label').map(l => l.text());
  expect(labels).toEqual(['Select all (2)', 'Oncogenic', 'Likely Oncogenic']);

  wrapper
    .find('.checkbox-list input[type="checkbox"]')
    .at(2)
    .simulate('change', { target: { checked: true } });
  wrapper.update();

  expect(wrapper.find('.rt-tr-group').length).toEqual(1);
  expect(wrapper.text()).toContain('Reset all filters');
  expect(wrapper.find('.filter-icon-active').length).toEqual(1);

  // selecting every remaining value flips the select all label
  wrapper
    .find('.checkbox-list input[type="checkbox"]')
    .at(1)
    .simulate('change', { target: { checked: true } });
  wrapper.update();
  expect(wrapper.find('.checkbox-list label').at(0).text()).toEqual(
    'Deselect all (2)'
  );

  wrapper
    .findWhere(n => n.type() === 'button' && n.text() === 'Reset all filters')
    .simulate('click');
  wrapper.update();
  expect(wrapper.find('.rt-tr-group').length).toEqual(3);
});
