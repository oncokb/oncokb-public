import { UsageSummary } from 'app/shared/api/generated/API';
import { remoteData } from 'cbioportal-frontend-commons';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import { match } from 'react-router-dom';
import Client from 'app/shared/api/clientInstance';
import ResourceUsageDetailsTable from './ResourceUsageDetailsTable';
import { decodeResourceUsageDetailPageURL } from 'app/shared/utils/Utils';
import {
  TimeGroupedUsageRecords,
  mapUsageSummaryToTimeGroupedUsageRecords,
  ToggleValue,
} from './usage-analysis-utils';

@inject('routing')
@observer
export default class ResourceUsageDetailsPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable resource: UsageSummary;

  endpoint: string = decodeResourceUsageDetailPageURL(
    this.props.match.params['endpoint']
  );

  readonly resourceDetail = remoteData<TimeGroupedUsageRecords>({
    await: () => [],
    invoke: async () => {
      this.resource = await Client.resourceDetailGetUsingGET({
        endpoint: this.endpoint,
      });
      return Promise.resolve(
        mapUsageSummaryToTimeGroupedUsageRecords(this.resource, 'email')
      );
    },
    default: {
      'Day Detail': [],
      'Year Detail': [],
      'Month Detail': [],
    },
  });

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
  }

  render() {
    return (
      <>
        <h5> {this.endpoint}</h5>
        <hr />
        <ResourceUsageDetailsTable
          data={this.resourceDetail.result}
          loadedData={this.resourceDetail.isComplete}
          defaultTimeType={ToggleValue.RESULTS_BY_MONTH}
        />
      </>
    );
  }
}
