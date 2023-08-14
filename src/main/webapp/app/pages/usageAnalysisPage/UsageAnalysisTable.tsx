import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Row } from 'react-bootstrap';
import {
  getUsageTableColumnDefinition,
  ToggleValue,
  UsageRecord,
  UsageTableColumnKey,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import { UsageToggleGroup } from './UsageToggleGroup';
import { UsageAnalysisCalendarButton } from 'app/components/calendarButton/UsageAnalysisCalendarButton';
import {
  emailHeader,
  endpointHeader,
  filterDependentTimeHeader,
  noPrivateEndpointHeader,
  usageHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import { UserOverviewUsage } from 'app/shared/api/generated/API';
import UsageText from 'app/shared/texts/UsageText';
import {
  PAGE_ROUTE,
  TABLE_DAY_FORMAT,
  TABLE_MONTH_FORMAT,
} from 'app/config/constants';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { SortingRule } from 'react-table';

type IUserUsageDetailsTable = {
  data: UserOverviewUsage[];
  loadedData: boolean;
  defaultResourcesType: ToggleValue;
  defaultTimeType: ToggleValue;
  defaultPageSize?: number;
};

@observer
export default class UsageAnalysisTable extends React.Component<
  IUserUsageDetailsTable,
  {}
> {
  @observable resourcesTypeToggleValue: ToggleValue = this.props
    .defaultResourcesType;
  @observable timeTypeToggleValue: ToggleValue = this.props.defaultTimeType;
  @observable fromDate: string | undefined;
  @observable toDate: string | undefined;
  @observable filterToggled: boolean;
  @observable dropdownMenuOpen: boolean;

  @autobind
  @action
  handleResourcesTypeToggleChange(value: ToggleValue) {
    this.resourcesTypeToggleValue = value;
  }

  @autobind
  @action
  handleTimeTypeToggleChange(value: ToggleValue) {
    this.timeTypeToggleValue = value;
  }

  @autobind
  @action
  handleFilterToggledChange(value: boolean) {
    this.filterToggled = value;
  }

  @computed get calculateDateGroupedData(): UsageRecord[] {
    let data: UsageRecord[] = [];
    if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH) {
      this.props.data.forEach((userOverviewUsage: UserOverviewUsage) => {
        Object.keys(userOverviewUsage.monthUsage).forEach(month =>
          data.push({
            resource: userOverviewUsage.userEmail,
            usage: userOverviewUsage.monthUsage[month],
            time: month,
            userId: userOverviewUsage.userId,
          })
        );
      });
    } else if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_DAY) {
      this.props.data.forEach((userOverviewUsage: UserOverviewUsage) => {
        Object.keys(userOverviewUsage.dayUsage).forEach(day =>
          data.push({
            resource: userOverviewUsage.userEmail,
            usage: userOverviewUsage.dayUsage[day],
            time: day,
            userId: userOverviewUsage.userId,
          })
        );
      });
    }

    if (this.filterToggled && data.length > 0) {
      let tableFormat: string;
      if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH) {
        tableFormat = TABLE_MONTH_FORMAT;
      } else if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_DAY) {
        tableFormat = TABLE_DAY_FORMAT;
      }
      data = data.filter(resource => {
        const fromTime = moment(this.fromDate).format(tableFormat);
        const toTime = moment(this.toDate).format(tableFormat);
        return resource.time >= fromTime && resource.time <= toTime;
      });
    }

    if (this.resourcesTypeToggleValue === ToggleValue.ALL_RESOURCES) {
      return data;
    } else if (this.resourcesTypeToggleValue === ToggleValue.PUBLIC_RESOURCES) {
      return _.filter(data, function (usage) {
        return !usage.resource.includes('/private/');
      });
    } else {
      return [];
    }
  }

  readonly allTimeColumns = [
    {
      id: 'userEmail',
      Header: emailHeader,
      accessor: 'userEmail',
      onFilter: (row: UserOverviewUsage, keyword: string) =>
        filterByKeyword(row.userEmail, keyword),
    },
    {
      id: 'totalUsage',
      Header: usageHeader,
      accessor: 'totalUsage',
      Cell(props: { original: UserOverviewUsage }) {
        return <UsageText usage={props.original.totalUsage} />;
      },
    },
    this.resourcesTypeToggleValue === ToggleValue.ALL_RESOURCES
      ? {
          id: 'endpoint',
          Header: endpointHeader,
          minWidth: 200,
          accessor: (row: UserOverviewUsage) =>
            `${row.endpoint} (${row.maxUsageProportion}%)`,
          onFilter: (row: UserOverviewUsage, keyword: string) =>
            filterByKeyword(row.endpoint, keyword),
        }
      : {
          id: 'noPrivateEndpoint',
          Header: noPrivateEndpointHeader,
          minWidth: 200,
          accessor: (row: UserOverviewUsage) =>
            `${row.endpoint} (${row.noPrivateMaxUsageProportion}%)`,
          onFilter: (row: UserOverviewUsage, keyword: string) =>
            filterByKeyword(row.noPrivateEndpoint, keyword),
        },
    {
      ...getUsageTableColumnDefinition(UsageTableColumnKey.OPERATION),
      sortable: false,
      className: 'd-flex justify-content-center',
      Cell(props: { original: UserOverviewUsage }) {
        return props.original.userId ? (
          <Link
            to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
          >
            <i className="fa fa-info-circle" />
          </Link>
        ) : (
          <i className="fa fa-info-circle" />
        );
      },
    },
  ];

  readonly dateGroupedColumns = [
    {
      id: 'userEmail',
      Header: emailHeader,
      accessor: 'resource',
      onFilter: (row: UsageRecord, keyword: string) =>
        filterByKeyword(row.resource, keyword),
    },
    {
      ...getUsageTableColumnDefinition(UsageTableColumnKey.USAGE),
      Cell(props: { original: UsageRecord }) {
        return <UsageText usage={props.original.usage} />;
      },
    },
    {
      ...getUsageTableColumnDefinition(UsageTableColumnKey.TIME),
      Header: filterDependentTimeHeader(this.timeTypeToggleValue),
      onFilter: (row: UsageRecord, keyword: string) =>
        filterByKeyword(row.time, keyword),
    },
    {
      ...getUsageTableColumnDefinition(UsageTableColumnKey.OPERATION),
      sortable: false,
      className: 'd-flex justify-content-center',
      Cell(props: { original: UsageRecord }) {
        return props.original.userId ? (
          <Link
            to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
          >
            <i className="fa fa-info-circle" />
          </Link>
        ) : (
          <i className="fa fa-info-circle" />
        );
      },
    },
  ];

  @computed get resetDefaultSort(): SortingRule[] {
    const sortingRules: SortingRule[] = [];
    if (this.filterToggled) {
      sortingRules.push({
        id: UsageTableColumnKey.TIME,
        desc: false,
      });
    } else {
      sortingRules.push({
        id: UsageTableColumnKey.TIME,
        desc: true,
      });
    }

    if (this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL) {
      sortingRules.push({
        id: 'totalUsage',
        desc: true,
      });
    } else if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH) {
      sortingRules.push(
        {
          id: UsageTableColumnKey.USAGE,
          desc: true,
        },
        {
          id: 'monthResetPlaceholder',
          desc: true,
        }
      );
    } else if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_DAY) {
      sortingRules.push(
        {
          id: UsageTableColumnKey.USAGE,
          desc: true,
        },
        {
          id: 'dayResetPlaceholder',
          desc: true,
        }
      );
    }

    return sortingRules;
  }

  readonly filters = () => {
    return (
      <Row>
        <UsageToggleGroup
          defaultValue={this.resourcesTypeToggleValue}
          toggleValues={[
            ToggleValue.ALL_RESOURCES,
            ToggleValue.PUBLIC_RESOURCES,
          ]}
          handleToggle={this.handleResourcesTypeToggleChange}
        />
        <UsageToggleGroup
          defaultValue={this.timeTypeToggleValue}
          toggleValues={[
            ToggleValue.RESULTS_IN_TOTAL,
            ToggleValue.RESULTS_BY_MONTH,
            ToggleValue.RESULTS_BY_DAY,
          ]}
          handleToggle={this.handleTimeTypeToggleChange}
        />
        <UsageAnalysisCalendarButton
          currentFromDate={this.fromDate}
          currentToDate={this.toDate}
          currentMenuState={this.dropdownMenuOpen}
          menuState={(isOpen: boolean) => {
            this.dropdownMenuOpen = isOpen;
          }}
          fromDate={(newDate: string) => {
            this.fromDate = newDate;
          }}
          toDate={(newDate: string) => {
            this.toDate = newDate;
          }}
          filterToggled={this.handleFilterToggledChange}
        />
      </Row>
    );
  };

  getTable() {
    if (this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL) {
      return (
        <OncoKBTable<UserOverviewUsage>
          key={this.timeTypeToggleValue}
          data={this.props.data}
          columns={this.allTimeColumns}
          loading={!this.props.loadedData}
          defaultSorted={this.resetDefaultSort}
          showPagination={true}
          minRows={1}
          defaultPageSize={this.props.defaultPageSize}
          filters={this.filters}
        />
      );
    } else {
      return (
        <OncoKBTable<UsageRecord>
          key={this.timeTypeToggleValue}
          data={this.calculateDateGroupedData}
          columns={this.dateGroupedColumns}
          loading={!this.props.loadedData}
          defaultSorted={this.resetDefaultSort}
          showPagination={true}
          minRows={1}
          defaultPageSize={this.props.defaultPageSize}
          filters={this.filters}
        />
      );
    }
  }

  render() {
    return this.getTable();
  }
}
