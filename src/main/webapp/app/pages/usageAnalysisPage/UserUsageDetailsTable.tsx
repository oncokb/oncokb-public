import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import _ from 'lodash';
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
import {
  TABLE_DAY_FORMAT,
  TABLE_MONTH_FORMAT,
  USAGE_ALL_TIME_KEY,
  USAGE_DAY_DETAIL_TIME_KEY,
  USAGE_DETAIL_TIME_KEY,
} from 'app/config/constants';
import { UsageToggleGroup } from './UsageToggleGroup';
import { UsageAnalysisCalendarButton } from 'app/components/calendarButton/UsageAnalysisCalendarButton';
import moment from 'moment';
import {
  filterDependentResourceHeader,
  filterDependentTimeHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';

type IUserUsageDetailsTable = {
  data: Map<string, UsageRecord[]>;
  loadedData: boolean;
  defaultResourcesType: ToggleValue;
  defaultTimeType: ToggleValue;
  pageSize?: number;
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
    let data = this.props.data.get(
      this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
        ? USAGE_ALL_TIME_KEY
        : this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH
        ? USAGE_DETAIL_TIME_KEY
        : USAGE_DAY_DETAIL_TIME_KEY
    );
    if (
      this.filterToggled &&
      data &&
      this.timeTypeToggleValue !== ToggleValue.RESULTS_IN_TOTAL
    ) {
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
      return data || [];
    } else if (this.resourcesTypeToggleValue === ToggleValue.PUBLIC_RESOURCES) {
      return (
        _.filter(data, function (usage) {
          return !usage.resource.includes('/private/');
        }) || []
      );
    } else if (this.resourcesTypeToggleValue === ToggleValue.CUMULATIVE_USAGE) {
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
        <OncoKBTable
          data={this.calculateData}
          columns={[
            {
              ...getUsageTableColumnDefinition(UsageTableColumnKey.RESOURCES),
              Header: filterDependentResourceHeader(this.timeTypeToggleValue),
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
              ...getUsageTableColumnDefinition(UsageTableColumnKey.TIME),
              Header: filterDependentTimeHeader(this.timeTypeToggleValue),
              onFilter: (data: UsageRecord, keyword) =>
                filterByKeyword(data.time, keyword),
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
          pageSize={this.props.pageSize}
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
