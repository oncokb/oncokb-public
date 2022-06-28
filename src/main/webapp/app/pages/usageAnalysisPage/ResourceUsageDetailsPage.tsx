import { UsageSummary } from 'app/shared/api/generated/API';
import { remoteData } from 'cbioportal-frontend-commons';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import { match } from 'react-router-dom';
import { ToggleValue, UsageRecord } from './UsageAnalysisPage';
import Client from 'app/shared/api/clientInstance';
import {
  USAGE_DETAIL_TIME_KEY,
  USAGE_ALL_TIME_KEY,
  USAGE_ALL_TIME_VALUE,
} from 'app/config/constants';
import ResourceUsageDetailsTable from './ResourceUsageDetailsTable';
import { decodeResourceUsageDetailPageURL } from 'app/shared/utils/Utils';

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

  readonly resourceDetail = remoteData<Map<string, UsageRecord[]>>({
    await: () => [],
    invoke: async () => {
      this.resource = await Client.resourceDetailGetUsingGET({
        endpoint: this.endpoint,
      });
      const result = new Map<string, UsageRecord[]>();
      const yearSummary = this.resource.year;
      const yearUsage: UsageRecord[] = [];
      Object.keys(yearSummary).forEach(key => {
        yearUsage.push({
          resource: key,
          usage: yearSummary[key],
          time: USAGE_ALL_TIME_VALUE,
        });
      });
      result.set(USAGE_ALL_TIME_KEY, yearUsage);

      const monthSummary = this.resource.month;
      const detailUsage: UsageRecord[] = [];
      Object.keys(monthSummary).forEach(key => {
        const month = monthSummary[key];
        Object.keys(month).forEach(key2 => {
          detailUsage.push({ resource: key2, usage: month[key2], time: key });
        });
      });
      result.set(USAGE_DETAIL_TIME_KEY, detailUsage);
      return Promise.resolve(result);
    },
    default: new Map(),
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
