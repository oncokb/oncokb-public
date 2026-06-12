import client from 'app/shared/api/clientInstance';
import { UsageResourceName } from 'app/shared/api/generated/API';
import { PromiseStatus } from 'app/shared/utils/PromiseUtils';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import { Alert } from 'react-bootstrap';
import { match } from 'react-router-dom';
import UsageAnalysisTable from './UsageAnalysisTable';
import { TimeToggleValue } from './usage-analysis-utils';

@inject('routing')
@observer
export default class ResourceUsageDetailsPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable resourceName: string | undefined;
  @observable loadStatus = PromiseStatus.pending;

  resourceId = Number(this.props.match.params['resourceId']);

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.loadResourceName();
  }

  @action.bound
  async loadResourceName() {
    if (!Number.isFinite(this.resourceId)) {
      this.loadStatus = PromiseStatus.error;
      return;
    }

    try {
      const resource: UsageResourceName = await client.usageResourceGetUsingGET(
        {
          resourceId: this.resourceId,
        }
      );
      this.resourceName = resource.resource;
      this.loadStatus = PromiseStatus.complete;
    } catch (error) {
      notifyError(error as Error, 'Failed to load resource usage data.');
      this.loadStatus = PromiseStatus.error;
    }
  }

  render() {
    if (!Number.isFinite(this.resourceId)) {
      return <h5>Invalid resource ID</h5>;
    }

    return (
      <>
        {this.resourceName ? (
          <h5>{this.resourceName}</h5>
        ) : this.loadStatus === PromiseStatus.error ? (
          <Alert variant="danger">Failed to load resource usage data.</Alert>
        ) : (
          <h5>{`Resource ID: ${this.resourceId}`}</h5>
        )}
        <hr />
        <UsageAnalysisTable
          mode="resourceSummary"
          resourceId={this.resourceId}
          defaultTimeType={TimeToggleValue.RESULTS_BY_MONTH}
          timeToggleValues={[
            TimeToggleValue.RESULTS_BY_YEAR,
            TimeToggleValue.RESULTS_BY_MONTH,
          ]}
          resourceToggleValues={[]}
          showEndpointColumn={false}
          showOperationColumn={false}
        />
      </>
    );
  }
}
