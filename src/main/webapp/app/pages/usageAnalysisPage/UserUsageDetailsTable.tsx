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
  UsageTableColumnKey,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import {
  PAGE_ROUTE,
  TABLE_DAY_FORMAT,
  TABLE_MONTH_FORMAT,
  USAGE_DAY_DETAIL_TIME_KEY,
  USAGE_MONTH_DETAIL_TIME_KEY,
  USAGE_YEAR_DETAIL_TIME_KEY,
  TABLE_YEAR_FORMAT,
} from 'app/config/constants';
import { UsageToggleGroup } from './UsageToggleGroup';
import { UsageAnalysisCalendarButton } from 'app/components/calendarButton/UsageAnalysisCalendarButton';
import moment from 'moment';
import {
  filterDependentResourceHeader,
  filterDependentTimeHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';
import { Link } from 'react-router-dom';
import { TimeGroupedUsageRecords, UsageRecord } from './usage-analysis-utils';

type IUserUsageDetailsTable = {
  data: TimeGroupedUsageRecords;
  loadedData: boolean;
  defaultResourcesType: ToggleValue;
  defaultTimeType: ToggleValue;
  defaultPageSize?: number;
};

@observer
export default class UserUsageDetailsTable extends React.Component<
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

  @computed get calculateData(): UsageRecord[] {
    let data = this.props.data[
      this.timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR
        ? USAGE_YEAR_DETAIL_TIME_KEY
        : this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH
        ? USAGE_MONTH_DETAIL_TIME_KEY
        : USAGE_DAY_DETAIL_TIME_KEY
    ];
    if (this.filterToggled && data) {
      let tableFormat: string;
      if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH) {
        tableFormat = TABLE_MONTH_FORMAT;
      } else if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_DAY) {
        tableFormat = TABLE_DAY_FORMAT;
      } else if (this.timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR) {
        tableFormat = TABLE_YEAR_FORMAT;
      }
      data = data.filter(resource => {
        const fromTime = moment(this.fromDate).format(tableFormat);
        const toTime = moment(this.toDate).format(tableFormat);
        return resource.time >= fromTime && resource.time <= toTime;
      });
    }
    if (this.resourcesTypeToggleValue === ToggleValue.ALL_RESOURCES) {
      return data || [];
    } else if (this.resourcesTypeToggleValue === ToggleValue.PUBLIC_RESOURCES) {
      return (data || []).filter(function (usage) {
        return !usage.userEmail.includes('/private/');
      });
    } else if (this.resourcesTypeToggleValue === ToggleValue.CUMULATIVE_USAGE) {
      if (data) {
        const cumulativeData: Map<string, UsageRecord> = new Map<
          string,
          UsageRecord
        >();
        data.forEach(resource => {
          if (!cumulativeData.has(resource.time)) {
            cumulativeData.set(resource.time, {
              userEmail: 'ALL',
              usage: 0,
              time: resource.time,
              resource: '',
              maxUsageProportion: 0,
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
        <OncoKBTable
          data={this.calculateData}
          columns={[
            {
              ...getUsageTableColumnDefinition(UsageTableColumnKey.RESOURCES),
              Header: filterDependentResourceHeader(this.timeTypeToggleValue),
              onFilter: (row: UsageRecord, keyword) =>
                filterByKeyword(row.userEmail, keyword),
              Cell(props: { original: UsageRecord }) {
                return props.original.userEmail === 'ALL' ? (
                  <div>ALL</div>
                ) : (
                  <Link
                    to={`${
                      PAGE_ROUTE.ADMIN_RESOURCE_DETAILS_LINK
                    }${props.original.userEmail.replace(/\//g, '!')}`}
                  >
                    {props.original.userEmail}
                  </Link>
                );
              },
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
              onFilter: (row: UsageRecord, keyword) =>
                filterByKeyword(row.time, keyword),
            },
          ]}
          loading={!this.props.loadedData}
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
          defaultPageSize={this.props.defaultPageSize}
          filters={() => {
            return (
              <Row>
                <UsageToggleGroup
                  defaultValue={this.resourcesTypeToggleValue}
                  toggleValues={[
                    ToggleValue.ALL_RESOURCES,
                    ToggleValue.PUBLIC_RESOURCES,
                    ToggleValue.CUMULATIVE_USAGE,
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
                  filterToggled={(filterActive: boolean) => {
                    this.filterToggled = filterActive;
                  }}
                />
              </Row>
            );
          }}
        />
      </>
    );
  }
}
