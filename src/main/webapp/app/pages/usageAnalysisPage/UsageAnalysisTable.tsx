import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Row } from 'react-bootstrap';
import {
  getUsageTableColumnDefinition,
  ToggleValue,
  UsageTableColumnKey,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import { UsageToggleGroup } from './UsageToggleGroup';
import { UsageAnalysisCalendarButton } from 'app/components/calendarButton/UsageAnalysisCalendarButton';
import {
  emailHeader,
  endpointHeader,
  filterDependentTimeHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';
import { PAGE_ROUTE } from 'app/config/constants';
import { Link } from 'react-router-dom';
import { SortingRule } from 'react-table';
import {
  UsageSummaryWithUsageTypes,
  UserOverviewUsageWithUsageTypes,
  mapUserOrResourceUsageToUsageRecords,
  UsageRecord,
} from './usage-analysis-utils';

type IUserUsageDetailsTable = {
  loadedData: boolean;
  defaultResourcesType: ToggleValue;
  defaultTimeType: ToggleValue;
  defaultPageSize?: number;
  data: UsageSummaryWithUsageTypes | UserOverviewUsageWithUsageTypes[];
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
    return mapUserOrResourceUsageToUsageRecords(
      this.props.data,
      this.timeTypeToggleValue,
      this.filterToggled,
      this.fromDate,
      this.toDate,
      this.resourcesTypeToggleValue === ToggleValue.ALL_RESOURCES
    );
  }

  @computed get dateGroupedColumns() {
    const columns = [];
    const isResources = Array.isArray(this.props.data);

    if (isResources) {
      columns.push({
        id: 'userEmail',
        Header: emailHeader,
        onFilter: (row: UsageRecord, keyword: string) =>
          filterByKeyword(row.userEmail, keyword),
        Cell(props: { original: UsageRecord }) {
          return props.original.userId ? (
            <Link
              to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
            >
              {props.original.userEmail}
            </Link>
          ) : (
            <div>{props.original.userEmail}</div>
          );
        },
      });
    }
    columns.push({
      ...getUsageTableColumnDefinition(UsageTableColumnKey.USAGE),
      Cell(props: { original: UsageRecord }) {
        return <UsageText usage={props.original.usage} />;
      },
    });
    columns.push({
      id: 'endpoint',
      Header: endpointHeader,
      minWidth: 200,
      onFilter: (row: UsageRecord, keyword: string) =>
        filterByKeyword(row.resource, keyword),
      Cell(props: { original: UsageRecord }) {
        return props.original.resource ? (
          <div>
            <Link
              to={`${
                PAGE_ROUTE.ADMIN_RESOURCE_DETAILS_LINK
              }${props.original.resource.replace(/\//g, '!')}`}
            >
              {props.original.resource}
            </Link>{' '}
            {isResources && <>({props.original.maxUsageProportion}%)</>}
          </div>
        ) : (
          <div>N/A</div>
        );
      },
    });
    columns.push({
      ...getUsageTableColumnDefinition(UsageTableColumnKey.TIME),
      Header: filterDependentTimeHeader(this.timeTypeToggleValue),
      onFilter: (row: UsageRecord, keyword: string) =>
        filterByKeyword(row.time, keyword),
    });
    if (isResources) {
      columns.push({
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
      });
    }
    return columns;
  }

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

    if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR) {
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
            ToggleValue.RESULTS_BY_YEAR,
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

  render() {
    return this.getTable();
  }
}
