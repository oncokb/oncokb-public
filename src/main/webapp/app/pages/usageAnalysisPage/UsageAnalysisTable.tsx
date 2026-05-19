import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { UsageAnalysisCalendarButton } from 'app/components/calendarButton/UsageAnalysisCalendarButton';
import {
  emailHeader,
  endpointHeader,
  filterDependentTimeHeader,
  usageHeader,
} from 'app/components/oncokbTable/header-constants';
import { PAGE_ROUTE } from 'app/config/constants';
import client from 'app/shared/api/clientInstance';
import UsageText from 'app/shared/texts/UsageText';
import autobind from 'autobind-decorator';
import {
  action,
  computed,
  observable,
  reaction,
  IReactionDisposer,
} from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { SortingRule } from 'react-table';
import { UsageToggleGroup } from './UsageToggleGroup';
import {
  buildUsageSort,
  formatDateForUsageInterval,
  getTotalCountFromHeaders,
  getTotalPages,
  toggleValueToInterval,
  UsageMode,
  UsageRecord,
  ResourceToggleValue,
  TimeToggleValue,
} from './usage-analysis-utils';
import {
  getUsageTableColumnDefinition,
  UsageTableColumnKey,
} from './usage-table-columns';

type UsageAnalysisTableProps = {
  mode: UsageMode;
  companyId?: number;
  userId?: number;
  resourceId?: number;
  resourcePath?: string;
  defaultResourcesType?: ResourceToggleValue;
  defaultTimeType: TimeToggleValue;
  defaultPageSize?: number;
  resourceToggleValues?: ResourceToggleValue[];
  timeToggleValues?: TimeToggleValue[];
  showEndpointColumn?: boolean;
  showTimeColumn?: boolean;
  showOperationColumn?: boolean;
};

const DEFAULT_SORTED: Record<UsageMode, SortingRule[]> = {
  userSummary: [
    { id: UsageTableColumnKey.TIME, desc: true },
    { id: UsageTableColumnKey.USAGE, desc: true },
  ],
  resourceSummary: [
    { id: UsageTableColumnKey.TIME, desc: true },
    { id: UsageTableColumnKey.USAGE, desc: true },
  ],
};

@observer
export default class UsageAnalysisTable extends React.Component<
  UsageAnalysisTableProps
> {
  @observable resourcesTypeToggleValue: ResourceToggleValue =
    this.props.defaultResourcesType || ResourceToggleValue.PUBLIC_RESOURCES;
  @observable timeTypeToggleValue: TimeToggleValue = this.props.defaultTimeType;
  @observable fromDate: string | undefined;
  @observable toDate: string | undefined;
  @observable filterToggled = false;
  @observable dropdownMenuOpen = false;
  @observable searchKeyword = '';
  @observable.shallow data: UsageRecord[] = [];
  @observable loading = false;
  @observable isError = false;
  @observable page = 0;
  @observable pageSize = this.props.defaultPageSize || 20;
  @observable pages = 1;
  @observable.shallow sorted: SortingRule[] = DEFAULT_SORTED[this.props.mode];

  readonly reactions: IReactionDisposer[] = [];

  componentDidMount() {
    this.reactions.push(
      reaction(
        () => ({
          mode: this.props.mode,
          companyId: this.props.companyId,
          userId: this.props.userId,
          resourceId: this.props.resourceId,
          resourcePath: this.props.resourcePath,
          publicOnly:
            this.resourcesTypeToggleValue !== ResourceToggleValue.ALL_RESOURCES,
          interval: toggleValueToInterval(this.timeTypeToggleValue),
          fromDate: this.filterToggled
            ? formatDateForUsageInterval(
                this.fromDate,
                toggleValueToInterval(this.timeTypeToggleValue)
              )
            : undefined,
          toDate: this.filterToggled
            ? formatDateForUsageInterval(
                this.toDate,
                toggleValueToInterval(this.timeTypeToggleValue)
              )
            : undefined,
          searchKeyword: this.searchKeyword,
          page: this.page,
          pageSize: this.pageSize,
          sorted: this.sorted.map(
            sortRule => `${sortRule.id}:${sortRule.desc}`
          ),
        }),
        () => {
          this.fetchData();
        },
        { fireImmediately: true }
      )
    );
  }

  componentWillUnmount() {
    this.reactions.forEach(disposer => disposer());
  }

  @autobind
  @action
  handleResourcesTypeToggleChange(value: ResourceToggleValue) {
    this.resourcesTypeToggleValue = value;
    this.page = 0;
  }

  @autobind
  @action
  handleTimeTypeToggleChange(value: TimeToggleValue) {
    this.timeTypeToggleValue = value;
    this.page = 0;
  }

  @autobind
  @action
  handleFilterToggledChange(value: boolean) {
    this.filterToggled = value;
    this.page = 0;
  }

  @autobind
  @action
  handleSearchChange(keyword: string) {
    this.searchKeyword = keyword;
    this.page = 0;
  }

  @autobind
  @action
  handleFetchData(tableState: {
    page: number;
    pageSize: number;
    sorted: SortingRule[];
  }) {
    this.page = tableState.page;
    this.pageSize = tableState.pageSize;
  }

  @autobind
  @action
  handleSortedChange(newSorted: SortingRule[]) {
    this.sorted =
      newSorted.length > 0 ? newSorted : DEFAULT_SORTED[this.props.mode];
    this.page = 0;
  }

  @computed
  get showEndpointColumn() {
    return this.props.showEndpointColumn !== false;
  }

  @computed
  get showOperationColumn() {
    return (
      this.props.mode === 'userSummary' &&
      this.props.showOperationColumn !== false
    );
  }

  @computed
  get showTimeColumn() {
    return this.props.showTimeColumn !== false;
  }

  @computed
  get columns() {
    const columns: any[] = [];

    if (this.props.mode === 'userSummary') {
      columns.push({
        id: 'userEmail',
        Header: emailHeader,
        accessor: 'userEmail',
        Cell(props: { original: UsageRecord }) {
          return props.original.userEmail ? (
            <Link
              to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
            >
              {props.original.userEmail}
            </Link>
          ) : (
            <div>N/A</div>
          );
        },
      });
    }

    columns.push({
      id: UsageTableColumnKey.USAGE,
      Header: usageHeader,
      accessor: 'usage',
      minWidth: 100,
      Cell(props: { original: UsageRecord }) {
        return <UsageText usage={props.original.usage} />;
      },
    });

    if (this.showEndpointColumn) {
      columns.push({
        id: 'endpoint',
        Header: endpointHeader,
        accessor: 'resource',
        minWidth: 200,
        Cell: (props: { original: UsageRecord }) => {
          return props.original.resource ? (
            <div>
              {props.original.resourceId !== undefined ? (
                <Link
                  to={`${PAGE_ROUTE.ADMIN_RESOURCE_DETAILS_LINK}${props.original.resourceId}`}
                >
                  {props.original.resource}
                </Link>
              ) : (
                <span>{props.original.resource}</span>
              )}{' '}
              {this.props.mode === 'userSummary' && (
                <>{`(${props.original.maxUsageProportion}%)`}</>
              )}
            </div>
          ) : (
            <div>N/A</div>
          );
        },
      });
    }

    if (this.showTimeColumn) {
      columns.push({
        ...getUsageTableColumnDefinition(UsageTableColumnKey.TIME),
        Header: filterDependentTimeHeader(this.timeTypeToggleValue),
      });
    }

    if (this.showOperationColumn) {
      columns.push({
        ...getUsageTableColumnDefinition(UsageTableColumnKey.OPERATION),
        sortable: false,
        className: 'd-flex justify-content-center',
        Cell(props: { original: UsageRecord }) {
          return (
            <Link
              to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
            >
              <i className="fa fa-info-circle" />
            </Link>
          );
        },
      });
    }

    return columns;
  }

  readonly filters = () => {
    const resourceToggleValues = this.props.resourceToggleValues || [
      ResourceToggleValue.ALL_RESOURCES,
      ResourceToggleValue.PUBLIC_RESOURCES,
    ];
    const timeToggleValues = this.props.timeToggleValues || [
      TimeToggleValue.RESULTS_BY_YEAR,
      TimeToggleValue.RESULTS_BY_MONTH,
      TimeToggleValue.RESULTS_BY_DAY,
    ];

    return (
      <Row>
        {resourceToggleValues.length > 0 && (
          <UsageToggleGroup
            defaultValue={this.resourcesTypeToggleValue}
            toggleValues={resourceToggleValues}
            handleToggle={this.handleResourcesTypeToggleChange}
          />
        )}
        <UsageToggleGroup
          defaultValue={this.timeTypeToggleValue}
          toggleValues={timeToggleValues}
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

  async fetchData() {
    if (
      this.props.mode === 'resourceSummary' &&
      this.props.userId === undefined
    ) {
      if (this.props.userId !== undefined) {
        return;
      }
    }

    this.loading = true;
    this.isError = false;

    const interval = toggleValueToInterval(this.timeTypeToggleValue);
    const sort = buildUsageSort(this.sorted, this.props.mode);
    const fromDate = this.filterToggled
      ? formatDateForUsageInterval(this.fromDate, interval)
      : undefined;
    const toDate = this.filterToggled
      ? formatDateForUsageInterval(this.toDate, interval)
      : undefined;

    try {
      let response;
      if (this.props.mode === 'userSummary') {
        response = await client.userUsageSummaryGetUsingGETWithHttpInfo({
          companyId: this.props.companyId,
          fromDate,
          interval,
          publicOnly:
            this.resourcesTypeToggleValue !== ResourceToggleValue.ALL_RESOURCES,
          page: this.page,
          resource: this.props.resourcePath,
          size: this.pageSize,
          sort,
          search: this.searchKeyword || undefined,
          toDate,
        });
        this.data = response.body.map((row: any) => ({
          userId: row.userId,
          userEmail: row.userEmail,
          resourceId: row.resourceId,
          usage: row.usage,
          time: row.time,
          resource: row.resource,
          maxUsageProportion: row.maxUsageProportion,
        }));
      } else if (this.props.userId !== undefined) {
        response = await client.userUsageGetUsingGETWithHttpInfo({
          fromDate,
          userId: this.props.userId,
          interval,
          publicOnly:
            this.resourcesTypeToggleValue !== ResourceToggleValue.ALL_RESOURCES,
          page: this.page,
          resource: this.props.resourcePath,
          size: this.pageSize,
          sort,
          search: this.searchKeyword || undefined,
          toDate,
        });
        this.data = response.body.map((row: any) => ({
          userId: row.userId?.toString(),
          userEmail: row.userEmail || '',
          resourceId: row.resourceId,
          usage: row.usage,
          time: row.time,
          resource: row.resource,
          maxUsageProportion: 0,
        }));
      } else {
        response = await client.resourceUsageGetUsingGETWithHttpInfo({
          fromDate,
          interval,
          publicOnly:
            this.resourcesTypeToggleValue !== ResourceToggleValue.ALL_RESOURCES,
          page: this.page,
          $queryParameters:
            this.props.resourceId !== undefined
              ? { resourceId: this.props.resourceId }
              : undefined,
          size: this.pageSize,
          sort,
          search: this.searchKeyword || undefined,
          toDate,
        });
        this.data = response.body.map((row: any) => ({
          resourceId: row.resourceId,
          userEmail: '',
          usage: row.usage,
          time: row.time,
          resource: row.resource,
          maxUsageProportion: 0,
        }));
      }

      this.pages = getTotalPages(
        getTotalCountFromHeaders(response.header),
        this.pageSize
      );
    } catch (error) {
      this.data = [];
      this.pages = 1;
      this.isError = true;
    } finally {
      this.loading = false;
    }
  }

  render() {
    return (
      <OncoKBTable<UsageRecord>
        data={this.data}
        columns={this.columns}
        loading={this.loading}
        showPagination={true}
        minRows={1}
        page={this.page}
        pageSize={this.pageSize}
        pages={this.pages}
        manual
        sorted={this.sorted}
        onSortedChange={this.handleSortedChange}
        onFetchData={this.handleFetchData}
        filters={this.filters}
        serverSideSearch
        searchKeyword={this.searchKeyword}
        onSearchChange={this.handleSearchChange}
      />
    );
  }
}
