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
import Alert from 'react-bootstrap/Alert';
import {
  UserOverviewUsage,
  UsageSummary,
  UserRegistrationSummary,
} from 'app/shared/api/generated/API';
import autobind from 'autobind-decorator';
import { USAGE_YEAR_DETAIL_TIME_KEY } from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';
import * as QueryString from 'query-string';
import { TableCellRenderer } from 'react-table';
import {
  operationHeader,
  resourceHeader,
  timeHeader,
  usageHeader,
} from 'app/components/oncokbTable/HeaderConstants';
import UsageAnalysisTable from 'app/pages/usageAnalysisPage/UsageAnalysisTable';
import { ToggleValue } from './usage-analysis-utils';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import RegistrationDetailsTable from './RegistrationDetailsTable';

export enum UsageType {
  REGISTRATION = 'REGISTRATION',
  USER = 'USER',
  RESOURCE = 'RESOURCE',
}

const ALLOWED_USAGETYPE: string[] = [
  UsageType.REGISTRATION,
  UsageType.USER,
  UsageType.RESOURCE,
];

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
  @observable usageType: UsageType = UsageType.REGISTRATION;

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
    onError: (error: Error) => {
      if (this.usageType === UsageType.USER) {
        notifyError(error, 'Failed to load user usage data.');
      }
    },
    default: [],
  });

  readonly usageDetail = remoteData<UsageSummary>({
    await: () => [],
    async invoke() {
      return await client.resourceUsageGetUsingGET({});
    },
    onError: (error: Error) => {
      if (this.usageType === UsageType.RESOURCE) {
        notifyError(error, 'Failed to load resource usage data.');
      }
    },
    default: {
      day: {},
      month: {},
      year: {},
    },
  });

  readonly registrationSummary = remoteData<UserRegistrationSummary[]>({
    await: () => [],
    async invoke() {
      return await client.registrationSummaryGetUsingGET({});
    },
    onError: (error: Error) => {
      if (this.usageType === UsageType.REGISTRATION) {
        notifyError(error, 'Failed to load registration data.');
      }
    },
    default: [],
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
          <Tab eventKey={UsageType.REGISTRATION} title="Registrations">
            <div className="mt-2">
              {this.registrationSummary.isError ? (
                <Alert variant="danger">
                  Failed to load registration data.
                </Alert>
              ) : (
                <RegistrationDetailsTable
                  data={this.registrationSummary.result}
                  loadedData={this.registrationSummary.isComplete}
                />
              )}
            </div>
          </Tab>
          <Tab eventKey={UsageType.USER} title="Users">
            <div className="mt-2">
              {this.users.isError ? (
                <Alert variant="danger">Failed to load user usage data.</Alert>
              ) : (
                <UsageAnalysisTable
                  data={this.users.result}
                  loadedData={this.users.isComplete}
                  defaultResourcesType={ToggleValue.PUBLIC_RESOURCES}
                  defaultTimeType={ToggleValue.RESULTS_BY_DAY}
                />
              )}
            </div>
          </Tab>
          <Tab eventKey={UsageType.RESOURCE} title="Resources">
            <div className="mt-2">
              {this.usageDetail.isError ? (
                <Alert variant="danger">
                  Failed to load resource usage data.
                </Alert>
              ) : (
                <UsageAnalysisTable
                  data={this.usageDetail.result}
                  loadedData={this.usageDetail.isComplete}
                  defaultResourcesType={ToggleValue.PUBLIC_RESOURCES}
                  defaultTimeType={ToggleValue.RESULTS_BY_DAY}
                />
              )}
            </div>
          </Tab>
        </Tabs>
      </>
    );
  }
}
