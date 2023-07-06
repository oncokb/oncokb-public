import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import { action, observable } from 'mobx';
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
  USAGE_DETAIL_TIME_KEY,
  USAGE_ALL_TIME_KEY,
  USAGE_DAY_DETAIL_TIME_KEY,
} from 'app/config/constants';
import { UsageToggleGroup } from './UsageToggleGroup';
import {
  emailHeader,
  filterDependentTimeHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';

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
        <OncoKBTable
          data={
            this.timeTypeToggleValue === ToggleValue.RESULTS_IN_TOTAL
              ? this.props.data.get(USAGE_ALL_TIME_KEY) || []
              : this.timeTypeToggleValue === ToggleValue.RESULTS_BY_MONTH
              ? this.props.data.get(USAGE_DETAIL_TIME_KEY) || []
              : this.props.data.get(USAGE_DAY_DETAIL_TIME_KEY) || []
          }
          columns={[
            {
              ...getUsageTableColumnDefinition(UsageTableColumnKey.RESOURCES),
              Header: emailHeader,
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
          filters={() => {
            return (
              <Row>
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
            );
          }}
        />
      </>
    );
  }
}
