import React from 'react';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Button, Col, Row } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, {
  SearchColumn
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { filterByKeyword, toAppLocalDateFormat } from 'app/shared/utils/Utils';
import _ from 'lodash';
import { LicenseType } from 'app/config/constants';
import styles from './UserDetailsPage.module.scss';
import LoadingIndicator from '../../components/loadingIndicator/LoadingIndicator';

@inject('routing')
@observer
export default class UserDetailsPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable users: UserDTO[] = [];
  @observable loadedUsers = false;
  @observable currentSelectedFilter: {
    activationKey: string | undefined;
    activated: boolean | undefined;
    licenseType: string[] | undefined;
  } = {
    activationKey: undefined,
    activated: undefined,
    licenseType: undefined
  };

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.getUsers();
  }

  @action
  async getUsers() {
    try {
      // Hard code the max returned user size. Need to fix pagination issue.
      this.users = await client.getAllUsersUsingGET({ size: 2000 });
      this.loadedUsers = true;
    } catch (e) {
      notifyError(e, 'Error fetching users');
    }
  }

  @action
  toggleFilter(query: any) {
    this.currentSelectedFilter = query;
  }

  @computed
  get filteredUser() {
    if (
      this.currentSelectedFilter === undefined ||
      Object.keys(this.currentSelectedFilter).length === 0
    ) {
      return this.users;
    } else {
      return this.users.filter((user: UserDTO) => {
        const result =
          (_.isUndefined(this.currentSelectedFilter.activated)
            ? true
            : user.activated === this.currentSelectedFilter.activated) &&
          (_.isUndefined(this.currentSelectedFilter.activationKey)
            ? true
            : user.activationKey ===
              this.currentSelectedFilter.activationKey) &&
          (_.isUndefined(this.currentSelectedFilter.licenseType)
            ? true
            : this.currentSelectedFilter.licenseType.includes(
                user.licenseType
              ));
        return result;
      });
    }
  }

  private getStatus(activated: boolean) {
    return activated ? 'Activated' : 'Deactivated';
  }

  private columns: SearchColumn<UserDTO>[] = [
    {
      id: 'createdDate',
      Header: <span className={styles.tableHeader}>Created Date</span>,
      maxWidth: 100,
      onFilter: (data: UserDTO, keyword) =>
        data.createdDate
          ? filterByKeyword(toAppLocalDateFormat(data.createdDate), keyword)
          : false,
      accessor: 'createdDate',
      Cell(props: { original: UserDTO }): any {
        return <div>{toAppLocalDateFormat(props.original.createdDate)}</div>;
      }
    },
    {
      id: 'email',
      Header: <span className={styles.tableHeader}>Email</span>,
      accessor: 'email',
      minWidth: 150,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      onFilter: (data: UserDTO, keyword) =>
        filterByKeyword(data.email, keyword),
      Cell(props: { original: UserDTO }) {
        return <span>{props.original.email}</span>;
      }
    },
    {
      id: 'activated',
      Header: <span className={styles.tableHeader}>Status</span>,
      accessor: 'activated',
      minWidth: 100,
      defaultSortDesc: false,
      className: 'justify-content-center',
      sortMethod: defaultSortMethod,
      onFilter: (data: UserDTO, keyword) =>
        filterByKeyword(this.getStatus(data.activated), keyword),
      Cell: (props: { original: UserDTO }) => {
        if (props.original.emailVerified) {
          return (
            <span
              className={
                props.original.activated ? 'text-success' : 'text-danger'
              }
            >
              {this.getStatus(props.original.activated)}
            </span>
          );
        } else {
          return (
            <span className="text-warning">
              Email hasn&apos;t been verified yet
            </span>
          );
        }
      }
    },
    {
      id: 'userName',
      Header: <span className={styles.tableHeader}>User Name</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.firstName + data.lastName
          ? filterByKeyword(data.firstName + data.lastName, keyword)
          : false,
      Cell(props: { original: UserDTO }) {
        return (
          <span>{`${props.original.firstName} ${props.original.lastName}`}</span>
        );
      }
    },
    {
      id: 'licenseType',
      Header: <span className={styles.tableHeader}>License Type</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.licenseType ? filterByKeyword(data.licenseType, keyword) : false,
      accessor: 'licenseType'
    },
    {
      id: 'approval',
      Header: <span className={styles.tableHeader}>Approval</span>,
      accessor: 'activated',
      minWidth: 60,
      defaultSortDesc: false,
      className: 'justify-content-center',
      sortMethod: defaultSortMethod,
      Cell(props: { original: UserDTO }) {
        return (
          <span
            className={
              props.original.activated ? 'text-success' : 'text-danger'
            }
          >
            {props.original.activated ? 'Yes' : 'No'}
          </span>
        );
      }
    },
    {
      id: 'jobTitle',
      Header: <span className={styles.tableHeader}>Job Title</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.jobTitle ? filterByKeyword(data.jobTitle, keyword) : false,
      accessor: 'jobTitle'
    },
    {
      id: 'company',
      Header: <span className={styles.tableHeader}>Company</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.company ? filterByKeyword(data.company, keyword) : false,
      accessor: 'company'
    },
    {
      id: 'city',
      Header: <span className={styles.tableHeader}>City</span>,
      maxWidth: 100,
      onFilter: (data: UserDTO, keyword) =>
        data.city ? filterByKeyword(data.city, keyword) : false,
      accessor: 'city'
    },
    {
      id: 'country',
      Header: <span className={styles.tableHeader}>Country</span>,
      maxWidth: 100,
      onFilter: (data: UserDTO, keyword) =>
        data.country ? filterByKeyword(data.country, keyword) : false,
      accessor: 'country'
    }
  ];

  render() {
    return (
      <>
        {this.loadedUsers ? (
          <>
            <Row className={getSectionClassName(true)}>
              <Col xs={4} className={styles.center}>
                <Button
                  className={styles.filterButton}
                  onClick={() => this.toggleFilter({})}
                >
                  All Users
                </Button>
              </Col>
              <Col xs={4} className={styles.center}>
                <Button
                  className={styles.filterButton}
                  onClick={() => this.toggleFilter({ activationKey: null })}
                >
                  Verified Users
                </Button>
              </Col>
              <Col xs={4} className={styles.center}>
                <Button
                  className={styles.filterButton}
                  onClick={() =>
                    this.toggleFilter({
                      activationKey: null,
                      licenseType: [
                        LicenseType.HOSPITAL,
                        LicenseType.RESEARCH_IN_COMMERCIAL,
                        LicenseType.COMMERCIAL
                      ]
                    })
                  }
                >
                  Commercial Users
                </Button>
              </Col>
            </Row>
            <Row className={getSectionClassName()}>
              <Col>
                <OncoKBTable
                  data={this.filteredUser}
                  columns={this.columns}
                  showPagination={true}
                  minRows={1}
                />
              </Col>
            </Row>
          </>
        ) : (
          <LoadingIndicator
            size={'big'}
            center={true}
            isLoading={!this.loadedUsers}
          />
        )}
      </>
    );
  }
}
