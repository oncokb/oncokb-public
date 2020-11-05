import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { UsageRecord } from 'app/shared/api/generated/API';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import {
  Dropdown,
  DropdownButton,
  Row,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';

type IUsageDetailsTableProps = {
  data: Map<string, UsageRecord[]>;
  loadedData: boolean;
  dropdownList: string[];
  defaultResourcesType: number;
};

@observer
export default class UsageDetailsTable extends React.Component<
  IUsageDetailsTableProps,
  {}
> {
  @observable dropdownValue = 'All';
  @observable resourcesTypeToggleValue = this.props.defaultResourcesType;

  @autobind
  handleResourcesTypeToggleChange(value: any) {
    this.resourcesTypeToggleValue = value;
  }

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
          <Row className="mt-2">
            <DropdownButton
              className="ml-3"
              id="dropdown-basic-button"
              title={this.dropdownValue}
              onSelect={(evt: any) => (this.dropdownValue = evt)}
            >
              {dropdown}
            </DropdownButton>
            <ToggleButtonGroup
              className="ml-2"
              type="radio"
              name="resources-type-options"
              defaultValue={this.props.defaultResourcesType}
              onChange={this.handleResourcesTypeToggleChange}
            >
              <ToggleButton value={1}>All Resources</ToggleButton>
              <ToggleButton value={2}>Only Public Resources</ToggleButton>
            </ToggleButtonGroup>
          </Row>
        ) : (
          <DropdownButton
            className="mt-2"
            id="dropdown-basic-button"
            title={this.dropdownValue}
            disabled
          ></DropdownButton>
        )}
        <OncoKBTable
          data={
            this.resourcesTypeToggleValue === 1
              ? this.props.data.get(this.dropdownValue) || []
              : _.filter(this.props.data.get(this.dropdownValue), function (
                  usage
                ) {
                  return !usage.resource.includes('/private/');
                }) || []
          }
          columns={[
            {
              id: 'resource',
              Header:
                this.resourcesTypeToggleValue === 1 ? (
                  <span>Resource</span>
                ) : (
                  <span>Resource(only public)</span>
                ),
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
