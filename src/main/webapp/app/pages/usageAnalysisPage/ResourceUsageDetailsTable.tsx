import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
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
  PAGE_ROUTE,
} from 'app/config/constants';
import { UsageToggleGroup } from './UsageToggleGroup';
import {
  emailHeader,
  filterDependentTimeHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';
import { Link } from 'react-router-dom';

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
              : this.props.data.get(USAGE_DETAIL_TIME_KEY) || []
          }
          columns={[
            {
              ...getUsageTableColumnDefinition(UsageTableColumnKey.RESOURCES),
              Header: emailHeader,
              onFilter: (row: UsageRecord, keyword) =>
                filterByKeyword(row.resource, keyword),
              Cell(props: { original: UsageRecord }) {
                return props.original.userId ? (
                  <Link
                    to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
                  >
                    {props.original.resource}
                  </Link>
                ) : (
                  <div>{props.original.resource}</div>
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
