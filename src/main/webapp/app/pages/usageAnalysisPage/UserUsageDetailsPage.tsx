import client from 'app/shared/api/clientInstance';
import { getSectionClassName } from '../account/AccountUtils';
import { InfoRow } from '../AccountPage';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { PromiseStatus } from 'app/shared/utils/PromiseUtils';
import { ResourceUsageAnalysisRow } from 'app/shared/api/generated/API';
import { observable, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Link, match } from 'react-router-dom';
import UsageAnalysisTable from './UsageAnalysisTable';
import {
  UserUsage,
  ResourceToggleValue,
  TimeToggleValue,
} from './usage-analysis-utils';

@inject('routing')
@observer
export default class UserUsageDetailsPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable user: UserUsage | undefined;
  @observable loadStatus = PromiseStatus.pending;

  userId = Number(this.props.match.params['id']);

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.loadUser();
  }

  @action.bound
  async loadUser() {
    if (!Number.isFinite(this.userId)) {
      this.loadStatus = PromiseStatus.error;
      return;
    }

    try {
      const rows = await client.userUsageGetUsingGET({
        userId: this.userId,
        interval: 'YEAR',
        publicOnly: false,
        page: 0,
        size: 1,
      });
      const firstRow: ResourceUsageAnalysisRow | undefined = rows[0];
      this.user = {
        userFirstName: firstRow?.userFirstName || '',
        userLastName: firstRow?.userLastName || '',
        userEmail: firstRow?.userEmail || '',
        company: firstRow?.company || '',
        jobTitle: firstRow?.jobTitle || '',
        licenseType: firstRow?.licenseType || '',
        summary: {
          day: {},
          month: {},
          year: {},
        },
      };
      this.loadStatus = PromiseStatus.complete;
    } catch (error) {
      notifyError(error as Error, 'Failed to load user data usage.');
      this.loadStatus = PromiseStatus.error;
    }
  }

  render() {
    return (
      <>
        <Row className={getSectionClassName(true)}>
          <Col>
            <h5>User Usage Information</h5>
            <hr />
            {this.user ? (
              <>
                <InfoRow title="First Name" content={this.user.userFirstName} />
                <InfoRow title="Last Name" content={this.user.userLastName} />
                <InfoRow title="Email">
                  <Link to={`/users/${this.user.userEmail}`}>
                    {this.user.userEmail}
                  </Link>
                </InfoRow>
                <InfoRow title="Company" content={this.user.company} />
                <InfoRow title="Job Title" content={this.user.jobTitle} />
                <InfoRow title="License Type" content={this.user.licenseType} />
              </>
            ) : this.loadStatus === PromiseStatus.error ? (
              <Alert variant="danger">Failed to load user data usage.</Alert>
            ) : (
              <span>Loading...</span>
            )}
          </Col>
        </Row>

        {this.loadStatus === PromiseStatus.complete &&
          Number.isFinite(this.userId) && (
            <UsageAnalysisTable
              mode="resourceSummary"
              userId={this.userId}
              defaultResourcesType={ResourceToggleValue.PUBLIC_RESOURCES}
              defaultTimeType={TimeToggleValue.RESULTS_BY_MONTH}
              defaultPageSize={10}
            />
          )}
      </>
    );
  }
}
