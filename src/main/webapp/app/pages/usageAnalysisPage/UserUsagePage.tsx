import { UsageRecord, UserUsage } from 'app/shared/api/generated/API';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import { match } from 'react-router-dom';
import Client from 'app/shared/api/clientInstance';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { getSectionClassName } from '../account/AccountUtils';
import { Col, Row } from 'react-bootstrap';
import UsageDetailsTable from './UsageDetailsTable';
import { InfoRow } from '../AccountPage';
import { USGAE_ALL_TIME_KEY } from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';

@inject('routing')
@observer
export default class UserUsagePage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable user: UserUsage;
  @observable dropdownList: string[] = [];

  userId = this.props.match.params['id'];

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
  }

  readonly usageDetail = remoteData<Map<string, UsageRecord[]>>({
    await: () => [],
    invoke: async () => {
      this.user = await Client.getUserUsageUsingGET({ id: this.userId });
      const result = new Map<string, UsageRecord[]>();
      const yearSummary = this.user.summary.year;
      const yearUsage: UsageRecord[] = [];
      Object.keys(yearSummary).forEach(key => {
        yearUsage.push({ resource: key, usage: yearSummary[key] });
      });
      result.set(USGAE_ALL_TIME_KEY, yearUsage);
      this.dropdownList.push(USGAE_ALL_TIME_KEY);

      const monthSummary = this.user.summary.month;
      Object.keys(monthSummary).forEach(key => {
        const month = monthSummary[key];
        const usage: UsageRecord[] = [];
        Object.keys(month).forEach(key2 => {
          usage.push({ resource: key2, usage: month[key2] });
        });
        result.set(key, usage);
        this.dropdownList.push(key);
      });
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

        <UsageDetailsTable
          data={this.usageDetail.result}
          loadedData={this.usageDetail.isComplete}
          dropdownList={this.dropdownList}
        />
      </>
    );
  }
}
