import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import client from 'app/shared/api/clientInstance';
import { match } from 'react-router';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import {
  encodeResourceUsageDetailPageURL,
  filterByKeyword,
} from 'app/shared/utils/Utils';
import { UserOverviewUsage, UsageSummary } from 'app/shared/api/generated/API';
import { Link } from 'react-router-dom';
import autobind from 'autobind-decorator';
import { Row, Dropdown, DropdownButton } from 'react-bootstrap';
import { PAGE_ROUTE, USAGE_YEAR_DETAIL_TIME_KEY } from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';
import * as QueryString from 'query-string';
import { UsageToggleGroup } from './UsageToggleGroup';
import { TableCellRenderer } from 'react-table';
import {
  operationHeader,
  resourceHeader,
  timeHeader,
  usageHeader,
  filterDependentResourceHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageText from 'app/shared/texts/UsageText';
import UsageAnalysisTable from 'app/pages/usageAnalysisPage/UsageAnalysisTable';

export enum UsageType {
  USER = 'USER',
  RESOURCE = 'RESOURCE',
}

export enum ToggleValue {
  ALL_RESOURCES = 'All Resources',
  PUBLIC_RESOURCES = 'Only Public Resources',
  CUMULATIVE_USAGE = 'Cumulative Usage',
  RESULTS_BY_YEAR = 'By Year',
  RESULTS_BY_MONTH = 'By Month',
  RESULTS_BY_DAY = 'By Day',
}

const ALLOWED_USAGETYPE: string[] = [UsageType.USER, UsageType.RESOURCE];

export enum UsageTableColumnKey {
  RESOURCES = 'resource',
  USAGE = 'usage',
  TIME = 'time',
  OPERATION = 'operation',
}

export function getUsageTableColumnDefinition(
  columnKey: string
):
  | {
      id: string;
      Header: TableCellRenderer;
      minWidth?: number;
      maxWidth?: number;
      accessor: string;
    }
  | undefined {
  switch (columnKey) {
    case UsageTableColumnKey.RESOURCES:
      return {
        id: UsageTableColumnKey.RESOURCES,
        Header: resourceHeader,
        accessor: UsageTableColumnKey.RESOURCES,
        minWidth: 200,
      };
    case UsageTableColumnKey.USAGE:
      return {
        id: UsageTableColumnKey.USAGE,
        Header: usageHeader,
        minWidth: 100,
        accessor: UsageTableColumnKey.USAGE,
      };
    case UsageTableColumnKey.TIME:
      return {
        id: UsageTableColumnKey.TIME,
        Header: timeHeader,
        minWidth: 100,
        accessor: UsageTableColumnKey.TIME,
      };
    case UsageTableColumnKey.OPERATION:
      return {
        id: UsageTableColumnKey.OPERATION,
        Header: operationHeader,
        maxWidth: 61,
        accessor: UsageTableColumnKey.OPERATION,
      };
    default:
      return undefined;
  }
}

@inject('routing')
@observer
export default class UsageAnalysisPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable userTabResourcesTypeToggleValue: ToggleValue =
    ToggleValue.PUBLIC_RESOURCES;
  @observable resourceTabResourcesTypeToggleValue: ToggleValue =
    ToggleValue.PUBLIC_RESOURCES;
  @observable dropdownList: string[] = [];
  @observable dropdownValue = USAGE_YEAR_DETAIL_TIME_KEY;
  @observable usageType: UsageType = UsageType.USER;

  readonly reactions: IReactionDisposer[] = [];

  updateLocationHash = (newType: UsageType) => {
    window.location.hash = QueryString.stringify({ type: newType });
  };

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash) as { type: UsageType };
          if (queryStrings.type) {
            if (ALLOWED_USAGETYPE.includes(queryStrings.type.toUpperCase())) {
              this.usageType = queryStrings.type;
            }
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.usageType,
        newVersion => this.updateLocationHash(newVersion)
      )
    );
  }

  readonly users = remoteData<UserOverviewUsage[]>({
    await: () => [],
    async invoke() {
      return await client.userOverviewUsageGetUsingGET({});
    },
    default: [],
  });

  readonly usageDetail = remoteData<UsageSummary>({
    await: () => [],
    async invoke() {
      return await client.resourceUsageGetUsingGET({});
    },
    default: {
      day: {},
      month: {},
      year: {},
    },
  });

  @autobind
  @action
  handleUserTabResourcesTypeToggleChange(value: ToggleValue) {
    this.userTabResourcesTypeToggleValue = value;
  }

  @autobind
  @action
  handleResourceTabResourcesTypeToggleChange(value: ToggleValue) {
    this.resourceTabResourcesTypeToggleValue = value;
  }

  @autobind
  @action
  toggleType(usageType: UsageType) {
    this.usageType = usageType;
  }

  render() {
    return (
      <>
        <Tabs
          defaultActiveKey={this.usageType}
          id="uncontrolled-tab-example"
          onSelect={k => this.toggleType(UsageType[k!])}
        >
          <Tab eventKey={UsageType.USER} title="Users">
            <div className="mt-2">
              <UsageAnalysisTable
                data={this.users.result}
                loadedData={this.users.isComplete}
                defaultResourcesType={ToggleValue.PUBLIC_RESOURCES}
                defaultTimeType={ToggleValue.RESULTS_BY_DAY}
              />
            </div>
          </Tab>
          <Tab eventKey={UsageType.RESOURCE} title="Resources">
            <div className="mt-2">
              <UsageAnalysisTable
                data={this.usageDetail.result}
                loadedData={this.users.isComplete}
                defaultResourcesType={ToggleValue.PUBLIC_RESOURCES}
                defaultTimeType={ToggleValue.RESULTS_BY_DAY}
              />
            </div>
          </Tab>
        </Tabs>
      </>
    );
  }
}
