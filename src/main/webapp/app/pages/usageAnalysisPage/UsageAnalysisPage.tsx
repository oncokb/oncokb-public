import { action, IReactionDisposer, observable, reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import client from 'app/shared/api/clientInstance';
import { match } from 'react-router';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Alert from 'react-bootstrap/Alert';
import { UserRegistrationSummary } from 'app/shared/api/generated/API';
import autobind from 'autobind-decorator';
import { USAGE_YEAR_DETAIL_TIME_KEY } from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';
import * as QueryString from 'query-string';
import UsageAnalysisTable from 'app/pages/usageAnalysisPage/UsageAnalysisTable';
import { ResourceToggleValue, TimeToggleValue } from './usage-analysis-utils';
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

@inject('routing')
@observer
export default class UsageAnalysisPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable userTabResourcesTypeToggleValue: ResourceToggleValue =
    ResourceToggleValue.PUBLIC_RESOURCES;
  @observable resourceTabResourcesTypeToggleValue: ResourceToggleValue =
    ResourceToggleValue.PUBLIC_RESOURCES;
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
  handleUserTabResourcesTypeToggleChange(value: ResourceToggleValue) {
    this.userTabResourcesTypeToggleValue = value;
  }

  @autobind
  @action
  handleResourceTabResourcesTypeToggleChange(value: ResourceToggleValue) {
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
          activeKey={this.usageType}
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
              <UsageAnalysisTable
                mode="userSummary"
                defaultResourcesType={ResourceToggleValue.PUBLIC_RESOURCES}
                defaultTimeType={TimeToggleValue.RESULTS_BY_DAY}
              />
            </div>
          </Tab>
          <Tab eventKey={UsageType.RESOURCE} title="Resources">
            <div className="mt-2">
              <UsageAnalysisTable
                mode="resourceSummary"
                defaultResourcesType={ResourceToggleValue.PUBLIC_RESOURCES}
                defaultTimeType={TimeToggleValue.RESULTS_BY_DAY}
              />
            </div>
          </Tab>
        </Tabs>
      </>
    );
  }
}
