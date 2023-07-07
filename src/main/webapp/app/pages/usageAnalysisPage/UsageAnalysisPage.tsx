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
  USAGE_DETAIL_TIME_KEY,
  USAGE_DAY_DETAIL_TIME_KEY,
  TABLE_MONTH_FORMAT,
  TABLE_DAY_FORMAT,
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
  filterDependentTimeHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';
import { UsageAnalysisCalendarButton } from 'app/components/calendarButton/UsageAnalysisCalendarButton';
import moment from 'moment';

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

  @observable resourceTabTimeTypeToggleValue: ToggleValue =
    ToggleValue.RESULTS_BY_MONTH;

  @observable resourceTabFromDate: string | undefined;
  @observable resourceTabToDate: string | undefined;
  @observable resourceTabFilterToggled: boolean;
  @observable resourceTabDropdownMenuOpen: boolean;

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
        Object.values(monthUsage).forEach(resourceEntry => {
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
  handleResourceTabTimeTypeToggleChange(value: ToggleValue) {
    this.resourceTabTimeTypeToggleValue = value;
  }

  @autobind
  @action
  toggleType(usageType: UsageType) {
    this.usageType = usageType;
  }

  @computed get calculateResourcesTabData(): UsageRecord[] {
    const keysIterator = Array.from(this.usageDetail.result.keys());
    let data: UsageRecord[] = [];
    if (this.resourceTabTimeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL) {
      data = this.usageDetail.result.get(USAGE_ALL_TIME_KEY) || [];
    } else {
      for (const key of keysIterator) {
        if (key !== USAGE_ALL_TIME_KEY) {
          const monthData = this.usageDetail.result.get(key);
          data = data.concat(monthData || []);
        }
      }
    }

    if (
      this.resourceTabFilterToggled &&
      data &&
      this.resourceTabTimeTypeToggleValue !== ToggleValue.RESULTS_IN_TOTAL
    ) {
      let tableFormat: string;
      if (
        this.resourceTabTimeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH
      ) {
        tableFormat = TABLE_MONTH_FORMAT;
      } else if (
        this.resourceTabTimeTypeToggleValue === ToggleValue.RESULTS_BY_DAY
      ) {
        tableFormat = TABLE_DAY_FORMAT;
      }
      data = data.filter(resource => {
        const fromTime = moment(this.resourceTabFromDate).format(tableFormat);
        const toTime = moment(this.resourceTabToDate).format(tableFormat);
        return resource.time >= fromTime && resource.time <= toTime;
      });
    }
    if (
      this.resourceTabResourcesTypeToggleValue === ToggleValue.ALL_RESOURCES
    ) {
      return data || [];
    } else if (
      this.resourceTabResourcesTypeToggleValue === ToggleValue.PUBLIC_RESOURCES
    ) {
      return (
        _.filter(data, function (usage) {
          return !usage.resource.includes('/private/');
        }) || []
      );
    } else if (
      this.resourceTabResourcesTypeToggleValue === ToggleValue.CUMULATIVE_USAGE
    ) {
      if (data) {
        const cumulativeData: Map<string, UsageRecord> = new Map<
          string,
          UsageRecord
        >();
        data.forEach(resource => {
          if (!cumulativeData.has(resource.time)) {
            cumulativeData.set(resource.time, {
              resource: 'ALL',
              usage: 0,
              time: resource.time,
            });
          }
          const resourceTimeRange = cumulativeData.get(resource.time);
          if (resourceTimeRange) {
            resourceTimeRange.usage += resource.usage;
          }
        });
        return Array.from(cumulativeData.values()) || [];
      } else {
        return [];
      }
    }
    return [];
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
                    Cell(props: { original: UserOverviewUsage }) {
                      return <UsageText usage={props.original.totalUsage} />;
                    },
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
                    id: UsageTableColumnKey.TIME,
                    desc: true,
                  },
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
                          ToggleValue.CUMULATIVE_USAGE,
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
                    Cell(props: { original: UsageRecord }) {
                      return <UsageText usage={props.original.usage} />;
                    },
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
                  {
                    ...getUsageTableColumnDefinition(UsageTableColumnKey.TIME),
                    Header: filterDependentTimeHeader(
                      this.resourceTabTimeTypeToggleValue
                    ),
                    onFilter: (data: UsageRecord, keyword) =>
                      filterByKeyword(data.time, keyword),
                  },
                ]}
                loading={this.usageDetail.isComplete ? false : true}
                defaultSorted={[
                  {
                    id: UsageTableColumnKey.TIME,
                    desc: true,
                  },
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
                          <Dropdown.Item key={key}>{key}</Dropdown.Item>
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
                          ToggleValue.CUMULATIVE_USAGE,
                        ]}
                        handleToggle={
                          this.handleResourceTabResourcesTypeToggleChange
                        }
                      />
                      <UsageToggleGroup
                        defaultValue={this.resourceTabTimeTypeToggleValue}
                        toggleValues={[
                          ToggleValue.RESULTS_BY_MONTH,
                          ToggleValue.RESULTS_IN_TOTAL,
                        ]}
                        handleToggle={
                          this.handleResourceTabTimeTypeToggleChange
                        }
                      />
                      <UsageAnalysisCalendarButton
                        currentFromDate={this.resourceTabFromDate}
                        currentToDate={this.resourceTabToDate}
                        currentMenuState={this.resourceTabDropdownMenuOpen}
                        menuState={(isOpen: boolean) => {
                          this.resourceTabDropdownMenuOpen = isOpen;
                        }}
                        fromDate={(newDate: string) => {
                          this.resourceTabFromDate = newDate;
                        }}
                        toDate={(newDate: string) => {
                          this.resourceTabToDate = newDate;
                        }}
                        filterToggled={(filterActive: boolean) => {
                          this.resourceTabFilterToggled = filterActive;
                        }}
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
