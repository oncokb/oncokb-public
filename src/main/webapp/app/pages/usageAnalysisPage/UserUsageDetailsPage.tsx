import { UserUsage } from 'app/shared/api/generated/API';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import { match } from 'react-router-dom';
import Client from 'app/shared/api/clientInstance';
import { getSectionClassName } from '../account/AccountUtils';
import { Col, Row } from 'react-bootstrap';
import UserUsageDetailsTable from './UserUsageDetailsTable';
import { InfoRow } from '../AccountPage';
import {
  USAGE_DETAIL_TIME_KEY,
  USGAE_ALL_TIME_KEY,
  USGAE_ALL_TIME_VALUE,
} from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';
import {
  ToggleValue,
  UsageRecord,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';

@inject('routing')
@observer
export default class UserUsageDetailsPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable user: UserUsage;

  userId = this.props.match.params['id'];

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
  }

  readonly usageDetail = remoteData<Map<string, UsageRecord[]>>({
    await: () => [],
    invoke: async () => {
      this.user = await Client.userUsageGetUsingGET({ userId: this.userId });
      const result = new Map<string, UsageRecord[]>();
      const yearSummary = this.user.summary.year;
      const yearUsage: UsageRecord[] = [];
      Object.keys(yearSummary).forEach(key => {
        yearUsage.push({
          resource: key,
          usage: yearSummary[key],
          time: USGAE_ALL_TIME_VALUE,
        });
      });
      result.set(USGAE_ALL_TIME_KEY, yearUsage);

      const monthSummary = this.user.summary.month;
      const detailSummary: UsageRecord[] = [];
      Object.keys(monthSummary).forEach(key => {
        const month = monthSummary[key];
        Object.keys(month).forEach(key2 => {
          detailSummary.push({ resource: key2, usage: month[key2], time: key });
        });
      });
      result.set(USAGE_DETAIL_TIME_KEY, detailSummary);
      return Promise.resolve(result);
    },
    default: new Map(),
  });

  render() {
    return (
      <>
        <Row className={getSectionClassName(true)}>
          <Col>
            <h5>User Infomation</h5>
            <hr />
            {this.user && (
              <>
                <InfoRow
                  title="First Name"
                  content={this.user.userFirstName}
                ></InfoRow>
                <InfoRow
                  title="Last Name"
                  content={this.user.userLastName}
                ></InfoRow>
                <InfoRow title="Email" content={this.user.userEmail}></InfoRow>
                <InfoRow title="Company" content={this.user.company}></InfoRow>
                <InfoRow
                  title="Job Title"
                  content={this.user.jobTitle}
                ></InfoRow>
                <InfoRow
                  title="License Type"
                  content={this.user.licenseType}
                ></InfoRow>
              </>
            )}
          </Col>
        </Row>

        <UserUsageDetailsTable
          data={this.usageDetail.result}
          loadedData={this.usageDetail.isComplete}
          defaultResourcesType={ToggleValue.PUBLIC_RESOURCES}
          defaultTimeType={ToggleValue.RESULTS_BY_MONTH}
        />
      </>
    );
  }
}
