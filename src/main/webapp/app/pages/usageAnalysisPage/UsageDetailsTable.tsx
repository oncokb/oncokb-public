import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { UsageRecord } from 'app/shared/api/generated/API';
import { filterByKeyword } from 'app/shared/utils/Utils';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';

type IUsageDetailsTableProps = {
  data: Map<string, UsageRecord[]>;
  loadedData: boolean;
  dropdownList: string[];
};

@observer
export default class UsageDetailsTable extends React.Component<
  IUsageDetailsTableProps,
  {}
> {
  @observable dropdownValue = 'All';

  render() {
    const dropdown: any = [];
    if (this.props.loadedData) {
      this.props.dropdownList
        .sort()
        .reverse()
        .forEach(key => {
          dropdown.push(<Dropdown.Item eventKey={key}>{key}</Dropdown.Item>);
        });
    }

    return (
      <>
        {this.props.loadedData ? (
          <DropdownButton
            className="mt-2"
            id="dropdown-basic-button"
            title={this.dropdownValue}
            onSelect={(evt: any) => (this.dropdownValue = evt)}
          >
            {dropdown}
          </DropdownButton>
        ) : (
          <DropdownButton
            className="mt-2"
            id="dropdown-basic-button"
            title={this.dropdownValue}
            disabled
          ></DropdownButton>
        )}
        <OncoKBTable
          data={this.props.data.get(this.dropdownValue) || []}
          columns={[
            {
              id: 'resource',
              Header: <span>Resource</span>,
              accessor: 'resource',
              minWidth: 200,
              onFilter: (data: UsageRecord, keyword) =>
                filterByKeyword(data.resource, keyword),
            },
            {
              id: 'usage',
              Header: <span>Usage</span>,
              minWidth: 100,
              accessor: 'usage',
            },
          ]}
          loading={this.props.loadedData ? false : true}
          defaultSorted={[
            {
              id: 'usage',
              desc: true,
            },
          ]}
          showPagination={true}
          minRows={1}
        />
      </>
    );
  }
}
