import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import Client from 'app/shared/api/clientInstance';
import { match } from 'react-router';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { filterByKeyword } from 'app/shared/utils/Utils';
import { UserOverviewUsage, UsageSummary } from 'app/shared/api/generated/API';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import autobind from 'autobind-decorator';
import { ToggleButton, ToggleButtonGroup, Row } from 'react-bootstrap';
import UsageDetailsTable from './UsageDetailsTable';
import {
  PAGE_ROUTE,
  USAGE_TOP_USERS_LIMIT,
  USGAE_ALL_TIME_KEY,
} from 'app/config/constants';
import { remoteData } from 'cbioportal-frontend-commons';

export type UsageRecord = {
  resource: string;
  usage: number;
};

@inject('routing')
@observer
export default class UsageAnalysisPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable topUsersToggleValue = 1;
  @observable resourcesTypeToggleValue = 2;
  @observable dropdownList: string[] = [];

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
  }

  readonly users = remoteData<UserOverviewUsage[]>({
    await: () => [],
    async invoke() {
      return await Client.userOverviewUsageGetUsingGET({});
    },
    default: [],
  });

  readonly usageDetail = remoteData<Map<string, UsageRecord[]>>({
    await: () => [],
    invoke: async () => {
      const resource = await Client.resourceUsageGetUsingGET({});
      const result = new Map<string, UsageRecord[]>();
      const yearSummary = resource.year;
      const yearUsage: UsageRecord[] = [];
      Object.keys(yearSummary).forEach(key => {
        yearUsage.push({ resource: key, usage: yearSummary[key] });
      });
      result.set(USGAE_ALL_TIME_KEY, yearUsage);
      this.dropdownList.push(USGAE_ALL_TIME_KEY);

      const monthSummary = resource.month;
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

  @autobind
  handleTopUsersToggleChange(value: any) {
    this.topUsersToggleValue = value;
  }

  @autobind
  handleResourcesTypeToggleChange(value: any) {
    this.resourcesTypeToggleValue = value;
  }

  render() {
    return (
      <>
        <Tabs defaultActiveKey="users" id="uncontrolled-tab-example">
          <Tab eventKey="users" title="Users">
            <Row className="mt-2">
              <ToggleButtonGroup
                className="ml-3"
                type="radio"
                name="top-users-options"
                defaultValue={1}
                onChange={this.handleTopUsersToggleChange}
              >
                <ToggleButton value={1}>All Users</ToggleButton>
                <ToggleButton value={2}>Top Users</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                className="ml-2"
                type="radio"
                name="resources-type-options"
                defaultValue={2}
                onChange={this.handleResourcesTypeToggleChange}
              >
                <ToggleButton value={1}>All Resources</ToggleButton>
                <ToggleButton value={2}>Only Public Resources</ToggleButton>
              </ToggleButtonGroup>
            </Row>
            <OncoKBTable
              data={
                this.topUsersToggleValue === 1
                  ? this.users.result
                  : _.filter(this.users.result, function (user) {
                      return user.totalUsage >= USAGE_TOP_USERS_LIMIT;
                    })
              }
              columns={[
                {
                  id: 'userEmail',
                  Header: <span>Email</span>,
                  accessor: 'userEmail',
                  minWidth: 200,
                  onFilter: (data: UserOverviewUsage, keyword) =>
                    filterByKeyword(data.userEmail, keyword),
                },
                {
                  id: 'totalUsage',
                  Header: <span>Total Usage</span>,
                  minWidth: 100,
                  accessor: 'totalUsage',
                },
                this.resourcesTypeToggleValue === 1
                  ? {
                      id: 'endpoint',
                      Header: <span>Most frequently used endpoint</span>,
                      minWidth: 200,
                      accessor: 'endpoint',
                      onFilter: (data: UserOverviewUsage, keyword) =>
                        filterByKeyword(data.endpoint, keyword),
                    }
                  : {
                      id: 'noPrivateEndpoint',
                      Header: (
                        <span>Most frequently used endpoint(only public)</span>
                      ),
                      minWidth: 200,
                      accessor: 'noPrivateEndpoint',
                      onFilter: (data: UserOverviewUsage, keyword) =>
                        filterByKeyword(data.noPrivateEndpoint, keyword),
                    },
                {
                  id: 'operations',
                  Header: <span>Details</span>,
                  maxWidth: 60,
                  sortable: false,
                  className: 'd-flex justify-content-center',
                  Cell(props: { original: UserOverviewUsage }) {
                    return (
                      <Link
                        to={`${PAGE_ROUTE.ADMIN_USER_USAGE_DETAILS_LINK}${props.original.userId}`}
                      >
                        <i className="fa fa-info-circle"></i>
                      </Link>
                    );
                  },
                },
              ]}
              loading={this.users.isComplete ? false : true}
              defaultSorted={[
                {
                  id: 'totalUsage',
                  desc: true,
                },
              ]}
              showPagination={true}
              minRows={1}
            />
          </Tab>
          <Tab eventKey="resourses" title="Resources">
            <UsageDetailsTable
              data={this.usageDetail.result}
              loadedData={this.usageDetail.isComplete}
              dropdownList={this.dropdownList}
              defaultResourcesType={2}
            />
          </Tab>
        </Tabs>
      </>
    );
  }
}
