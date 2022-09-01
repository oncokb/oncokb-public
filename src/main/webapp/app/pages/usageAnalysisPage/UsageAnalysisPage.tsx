import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import client from 'app/shared/api/clientInstance';
import { match } from 'react-router';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import {
  encodeResourceUsageDetailPageURL,
  filterByKeyword,
} from 'app/shared/utils/Utils';
import { UserOverviewUsage } from 'app/shared/api/generated/API';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import autobind from 'autobind-decorator';
import { Row, Dropdown, DropdownButton } from 'react-bootstrap';
import {
  PAGE_ROUTE,
  USAGE_TOP_USERS_LIMIT,
  USAGE_ALL_TIME_KEY,
} from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';
import * as QueryString from 'query-string';
import { UsageToggleGroup } from './UsageToggleGroup';
import { TableCellRenderer } from 'react-table';
import {
  emailHeader,
  endpointHeader,
  noPrivateEndpointHeader,
  operationHeader,
  resourceHeader,
  timeHeader,
  usageHeader,
  filterDependentResourceHeader,
} from 'app/components/oncokbTable/HeaderConstants';

export type UsageRecord = {
  resource: string;
  usage: number;
  time: string;
};

enum UsageType {
  USER = 'USER',
  RESOURCE = 'RESOURCE',
}

export enum ToggleValue {
  ALL_USERS = 'All Users',
  TOP_USERS = 'Top Users',
  ALL_RESOURCES = 'All Resources',
  PUBLIC_RESOURCES = 'Only Public Resources',
  CUMULATIVE_USAGE = 'Cumulative Usage',
  RESULTS_IN_TOTAL = 'By Year',
  RESULTS_BY_MONTH = 'By Month',
  RESULTS_BY_DAY = 'By Day',
}

const ALLOWED_USAGETYPE: string[] = [UsageType.USER, UsageType.RESOURCE];

export enum UsageTableColumnKey {
  RESOURCES = 'resource',
  USAGE = 'usage',
  TIME = 'time',
  OPERATION = 'operation',
}

export function getUsageTableColumnDefinition(
  columnKey: string
):
  | {
      id: string;
      Header: TableCellRenderer;
      minWidth?: number;
      maxWidth?: number;
      accessor: string;
    }
  | undefined {
  switch (columnKey) {
    case UsageTableColumnKey.RESOURCES:
      return {
        id: UsageTableColumnKey.RESOURCES,
        Header: resourceHeader,
        accessor: UsageTableColumnKey.RESOURCES,
        minWidth: 200,
      };
    case UsageTableColumnKey.USAGE:
      return {
        id: UsageTableColumnKey.USAGE,
        Header: usageHeader,
        minWidth: 100,
        accessor: UsageTableColumnKey.USAGE,
      };
    case UsageTableColumnKey.TIME:
      return {
        id: UsageTableColumnKey.TIME,
        Header: timeHeader,
        minWidth: 100,
        accessor: UsageTableColumnKey.TIME,
      };
    case UsageTableColumnKey.OPERATION:
      return {
        id: UsageTableColumnKey.OPERATION,
        Header: operationHeader,
        maxWidth: 61,
        accessor: UsageTableColumnKey.OPERATION,
      };
    default:
      return undefined;
  }
}

@inject('routing')
@observer
export default class UsageAnalysisPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable topUsersToggleValue: ToggleValue = ToggleValue.ALL_USERS;
  @observable userTabResourcesTypeToggleValue: ToggleValue =
    ToggleValue.PUBLIC_RESOURCES;
  @observable resourceTabResourcesTypeToggleValue: ToggleValue =
    ToggleValue.PUBLIC_RESOURCES;
  @observable dropdownList: string[] = [];
  @observable dropdownValue = 'All';
  @observable usageType: UsageType = UsageType.USER;

  readonly reactions: IReactionDisposer[] = [];

  updateLocationHash = (newType: UsageType) => {
    window.location.hash = QueryString.stringify({ type: newType });
  };

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash) as { type: UsageType };
          if (queryStrings.type) {
            if (ALLOWED_USAGETYPE.includes(queryStrings.type.toUpperCase())) {
              this.usageType = queryStrings.type;
            }
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.usageType,
        newVersion => this.updateLocationHash(newVersion)
      )
    );
  }

  readonly users = remoteData<UserOverviewUsage[]>({
    await: () => [],
    async invoke() {
      return await client.userOverviewUsageGetUsingGET({});
    },
    default: [],
  });

  readonly usageDetail = remoteData<Map<string, UsageRecord[]>>({
    await: () => [],
    invoke: async () => {
      const resource = await client.resourceUsageGetUsingGET({});
      const result = new Map<string, UsageRecord[]>();
      const yearSummary = resource.year;
      const yearUsage: UsageRecord[] = [];
      Object.keys(yearSummary).forEach(resourceEntry => {
        yearUsage.push({
          resource: resourceEntry,
          usage: yearSummary[resourceEntry],
          time: '',
        });
      });
      result.set(USAGE_ALL_TIME_KEY, yearUsage);
      this.dropdownList.push(USAGE_ALL_TIME_KEY);

      const monthSummary = resource.month;
      Object.keys(monthSummary).forEach(month => {
        const monthUsage = monthSummary[month];
        const usageArray: UsageRecord[] = [];
        Object.keys(monthUsage).forEach(resourceEntry => {
          usageArray.push({
            resource: resourceEntry,
            usage: monthUsage[resourceEntry],
            time: month,
          });
        });
        result.set(month, usageArray);
        this.dropdownList.push(month);
      });

      return Promise.resolve(result);
    },
    default: new Map(),
  });

  @autobind
  @action
  handleTopUsersToggleChange(value: ToggleValue) {
    this.topUsersToggleValue = value;
  }

  @autobind
  @action
  handleUserTabResourcesTypeToggleChange(value: ToggleValue) {
    this.userTabResourcesTypeToggleValue = value;
  }

  @autobind
  @action
  handleResourceTabResourcesTypeToggleChange(value: ToggleValue) {
    this.resourceTabResourcesTypeToggleValue = value;
  }

  @autobind
  @action
  toggleType(usageType: UsageType) {
    this.usageType = usageType;
  }

  @computed get calculateResourcesTabData(): UsageRecord[] {
    if (
      this.resourceTabResourcesTypeToggleValue === ToggleValue.ALL_RESOURCES
    ) {
      return this.usageDetail.result.get(this.dropdownValue) || [];
    } else {
      return (
        _.filter(this.usageDetail.result.get(this.dropdownValue), function (
          usage
        ) {
          return !usage.resource.includes('/private/');
        }) || []
      );
    }
  }

  render() {
    return (
      <>
        <Tabs
          defaultActiveKey={this.usageType}
          id="uncontrolled-tab-example"
          onSelect={k => this.toggleType(UsageType[k!])}
        >
          <Tab eventKey={UsageType.USER} title="Users">
            <div className="mt-2">
              <OncoKBTable
                data={
                  this.topUsersToggleValue === ToggleValue.ALL_USERS
                    ? this.users.result
                    : _.filter(this.users.result, function (user) {
                        return user.totalUsage >= USAGE_TOP_USERS_LIMIT;
                      })
                }
                columns={[
                  {
                    id: 'userEmail',
                    Header: emailHeader,
                    accessor: 'userEmail',
                    minWidth: 200,
                    onFilter: (data: UserOverviewUsage, keyword) =>
                      filterByKeyword(data.userEmail, keyword),
                  },
                  {
                    id: 'totalUsage',
                    Header: usageHeader,
                    minWidth: 100,
                    accessor: 'totalUsage',
                  },
                  this.userTabResourcesTypeToggleValue ===
                  ToggleValue.ALL_RESOURCES
                    ? {
                        id: 'endpoint',
                        Header: endpointHeader,
                        minWidth: 200,
                        accessor: 'endpoint',
                        onFilter: (data: UserOverviewUsage, keyword) =>
                          filterByKeyword(data.endpoint, keyword),
                      }
                    : {
                        id: 'noPrivateEndpoint',
                        Header: noPrivateEndpointHeader,
                        minWidth: 200,
                        accessor: 'noPrivateEndpoint',
                        onFilter: (data: UserOverviewUsage, keyword) =>
                          filterByKeyword(data.noPrivateEndpoint, keyword),
                      },
                  {
                    ...getUsageTableColumnDefinition(
                      UsageTableColumnKey.OPERATION
                    ),
                    sortable: false,
                    className: 'd-flex justify-content-center',
                    Cell(props: { original: UserOverviewUsage }) {
                      return (
                        props.original.userId && (
                          <Link
                            to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
                          >
                            <i className="fa fa-info-circle"></i>
                          </Link>
                        )
                      );
                    },
                  },
                ]}
                loading={this.users.isPending}
                defaultSorted={[
                  {
                    id: 'totalUsage',
                    desc: true,
                  },
                ]}
                showPagination={true}
                minRows={1}
                filters={() => {
                  return (
                    <Row>
                      <UsageToggleGroup
                        defaultValue={this.topUsersToggleValue}
                        toggleValues={[
                          ToggleValue.ALL_USERS,
                          ToggleValue.TOP_USERS,
                        ]}
                        handleToggle={this.handleTopUsersToggleChange}
                      />
                      <UsageToggleGroup
                        defaultValue={this.userTabResourcesTypeToggleValue}
                        toggleValues={[
                          ToggleValue.ALL_RESOURCES,
                          ToggleValue.PUBLIC_RESOURCES,
                        ]}
                        handleToggle={
                          this.handleUserTabResourcesTypeToggleChange
                        }
                      />
                    </Row>
                  );
                }}
              />
            </div>
          </Tab>
          <Tab eventKey={UsageType.RESOURCE} title="Resources">
            <div className="mt-2">
              <OncoKBTable
                data={this.calculateResourcesTabData}
                columns={[
                  {
                    ...getUsageTableColumnDefinition(
                      UsageTableColumnKey.RESOURCES
                    ),
                    Header: filterDependentResourceHeader(
                      this.resourceTabResourcesTypeToggleValue
                    ),
                    onFilter: (data: UsageRecord, keyword) =>
                      filterByKeyword(data.resource, keyword),
                  },
                  {
                    ...getUsageTableColumnDefinition(UsageTableColumnKey.USAGE),
                  },
                  {
                    ...getUsageTableColumnDefinition(
                      UsageTableColumnKey.OPERATION
                    ),
                    sortable: false,
                    className: 'd-flex justify-content-center',
                    Cell(props: { original: UsageRecord }) {
                      return (
                        <Link
                          to={`${
                            PAGE_ROUTE.ADMIN_RESOURCE_DETAILS_LINK
                          }${encodeResourceUsageDetailPageURL(
                            props.original.resource
                          )}`}
                        >
                          <i className="fa fa-info-circle"></i>
                        </Link>
                      );
                    },
                  },
                ]}
                loading={this.usageDetail.isComplete ? false : true}
                defaultSorted={[
                  {
                    id: UsageTableColumnKey.USAGE,
                    desc: true,
                  },
                ]}
                showPagination={true}
                minRows={1}
                filters={() => {
                  const monthDropdown: any = [];
                  if (this.usageDetail.isComplete) {
                    this.dropdownList
                      .sort()
                      .reverse()
                      .forEach(key => {
                        monthDropdown.push(
                          <Dropdown.Item eventKey={key}>{key}</Dropdown.Item>
                        );
                      });
                  }
                  return this.usageDetail.isComplete ? (
                    <Row>
                      <DropdownButton
                        className="ml-3"
                        id="dropdown-basic-button"
                        title={this.dropdownValue}
                        onSelect={(evt: any) => (this.dropdownValue = evt)}
                      >
                        {monthDropdown}
                      </DropdownButton>
                      <UsageToggleGroup
                        defaultValue={this.resourceTabResourcesTypeToggleValue}
                        toggleValues={[
                          ToggleValue.ALL_RESOURCES,
                          ToggleValue.PUBLIC_RESOURCES,
                        ]}
                        handleToggle={
                          this.handleResourceTabResourcesTypeToggleChange
                        }
                      />
                    </Row>
                  ) : (
                    <DropdownButton
                      className="mt-2"
                      id="dropdown-basic-button"
                      title={this.dropdownValue}
                      disabled
                    ></DropdownButton>
                  );
                }}
              />
            </div>
          </Tab>
        </Tabs>
      </>
    );
  }
}
