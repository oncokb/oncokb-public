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
  USAGE_ALL_TIME_KEY,
  USAGE_DETAIL_TIME_KEY,
  USAGE_DAY_DETAIL_TIME_KEY,
} from 'app/config/constants';
import { UsageToggleGroup } from './UsageToggleGroup';

type IUserUsageDetailsTable = {
  data: Map<string, UsageRecord[]>;
  loadedData: boolean;
  defaultResourcesType: ToggleValue;
  defaultTimeType: ToggleValue;
};

@observer
export default class UserUsageDetailsTable extends React.Component<
  IUserUsageDetailsTable,
  {}
> {
  @observable resourcesTypeToggleValue: ToggleValue = this.props
    .defaultResourcesType;
  @observable timeTypeToggleValue: ToggleValue = this.props.defaultTimeType;

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
    const data = this.props.data.get(
      this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
        ? USAGE_ALL_TIME_KEY
        : this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH
        ? USAGE_DETAIL_TIME_KEY
        : USAGE_DAY_DETAIL_TIME_KEY
    );
    if (this.resourcesTypeToggleValue === ToggleValue.ALL_RESOURCES) {
      return data || [];
    } else if (this.resourcesTypeToggleValue === ToggleValue.PUBLIC_RESOURCES) {
      return (
        _.filter(data, function (usage) {
          return !usage.resource.includes('/private/');
        }) || []
      );
    } else {
      if (data) {
        const cumulativeData: UsageRecord[] = [];
        data.forEach(value => {
          if (!cumulativeData.find(value1 => value1.time === value.time)) {
            cumulativeData.push({
              resource: 'ALL',
              usage: 0,
              time: value.time,
            });
          }
          // @ts-ignore
          cumulativeData.find(value1 => value1.time === value.time).usage +=
            value.usage;
        });
        return cumulativeData;
      } else {
        return [];
      }
    }
  }

  render() {
    return (
      <>
        <Row className="mt-2">
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
        </Row>
        <OncoKBTable
          data={this.calculateData}
          columns={[
            {
              ...getUsageTableColumnDefinition(UsageTableColumnKey.RESOURCES),
              Header: (
                <span>
                  Resource{' '}
                  {this.resourcesTypeToggleValue ===
                  ToggleValue.PUBLIC_RESOURCES
                    ? '(only public)'
                    : null}
                </span>
              ),
              onFilter: (data: UsageRecord, keyword) =>
                filterByKeyword(data.resource, keyword),
            },
            { ...getUsageTableColumnDefinition(UsageTableColumnKey.USAGE) },
            {
              ...getUsageTableColumnDefinition(UsageTableColumnKey.TIME),
              Header: (
                <span>
                  {this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
                    ? 'Duration'
                    : 'Time'}
                </span>
              ),
              onFilter: (data: UsageRecord, keyword) =>
                filterByKeyword(data.time, keyword),
            },
          ]}
          loading={this.props.loadedData ? false : true}
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
        />
      </>
    );
  }
}
