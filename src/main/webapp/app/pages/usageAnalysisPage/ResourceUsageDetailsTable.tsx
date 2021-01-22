import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import { action, observable } from 'mobx';
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

type IResourceUsageDetailsTable = {
  data: Map<string, UsageRecord[]>;
  loadedData: boolean;
  defaultTimeType: ToggleValue;
};

@observer
export default class ResourceUsageDetailsTable extends React.Component<
  IResourceUsageDetailsTable,
  {}
> {
  @observable timeTypeToggleValue: ToggleValue = this.props.defaultTimeType;

  @autobind
  @action
  handleTimeTypeToggleChange(value: ToggleValue) {
    this.timeTypeToggleValue = value;
  }

  render() {
    return (
      <>
        <Row className="mt-2">
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
          data={
            this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
              ? this.props.data.get(USGAE_ALL_TIME_KEY) || []
              : this.props.data.get(USAGE_DETAIL_TIME_KEY) || []
          }
          columns={[
            {
              id: 'resource',
              Header: <span>User</span>,
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
