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
  UsageTableColumnKey,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import {
  USAGE_MONTH_DETAIL_TIME_KEY,
  PAGE_ROUTE,
  USAGE_YEAR_DETAIL_TIME_KEY,
} from 'app/config/constants';
import { UsageToggleGroup } from './UsageToggleGroup';
import {
  emailHeader,
  filterDependentTimeHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';
import { Link } from 'react-router-dom';
import { UsageRecord, TimeGroupedUsageRecords } from './usage-analysis-utils';

type IResourceUsageDetailsTable = {
  data: TimeGroupedUsageRecords;
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
            this.timeTypeToggleValue === ToggleValue.RESULTS_BY_YEAR
              ? this.props.data[USAGE_YEAR_DETAIL_TIME_KEY]
              : this.props.data[USAGE_MONTH_DETAIL_TIME_KEY]
          }
          columns={[
            {
              ...getUsageTableColumnDefinition(UsageTableColumnKey.RESOURCES),
              Header: emailHeader,
              onFilter: (row: UsageRecord, keyword) =>
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
                    ToggleValue.RESULTS_BY_YEAR,
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
