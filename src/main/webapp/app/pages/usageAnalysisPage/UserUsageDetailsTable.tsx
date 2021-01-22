import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { Row } from 'react-bootstrap';
import {
  ToggleValue,
  usageColumn,
  UsageRecord,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import {
  USAGE_DETAIL_TIME_KEY,
  USGAE_ALL_TIME_KEY,
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
        ? USGAE_ALL_TIME_KEY
        : USAGE_DETAIL_TIME_KEY
    );
    if (this.resourcesTypeToggleValue === ToggleValue.ALL_RESOURCES) {
      return data || [];
    } else {
      return (
        _.filter(data, function (usage) {
          return !usage.resource.includes('/private/');
        }) || []
      );
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
            ]}
            handleToggle={this.handleResourcesTypeToggleChange}
          />
          <UsageToggleGroup
            defaultValue={this.timeTypeToggleValue}
            toggleValues={[
              ToggleValue.RESULTS_IN_TOTAL,
              ToggleValue.RESULTS_BY_MONTH,
            ]}
            handleToggle={this.handleTimeTypeToggleChange}
          />
        </Row>
        <OncoKBTable
          data={this.calculateData}
          columns={[
            {
              id: 'resource',
              Header: (
                <span>
                  Resource{' '}
                  {this.resourcesTypeToggleValue === ToggleValue.ALL_RESOURCES
                    ? null
                    : '(only public)'}
                </span>
              ),
              accessor: 'resource',
              minWidth: 200,
              onFilter: (data: UsageRecord, keyword) =>
                filterByKeyword(data.resource, keyword),
            },
            usageColumn,
            {
              id: 'time',
              Header: (
                <span>
                  {this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
                    ? 'Duration'
                    : 'Time'}
                </span>
              ),
              minWidth: 100,
              accessor: 'time',
              onFilter: (data: UsageRecord, keyword) =>
                filterByKeyword(data.time, keyword),
            },
          ]}
          loading={this.props.loadedData ? false : true}
          defaultSorted={[
            {
              id: 'time',
              desc: true,
            },
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
