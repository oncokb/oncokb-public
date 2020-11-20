import React from 'react';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Button, Col, Row, Modal } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { filterByKeyword, toAppLocalDateFormat } from 'app/shared/utils/Utils';
import _ from 'lodash';
import {
  AUTHORITIES,
  LicenseType,
  NOT_CHANGEABLE_AUTHORITIES,
  PAGE_ROUTE,
  USER_AUTHORITIES,
  USER_AUTHORITY,
} from 'app/config/constants';
import styles from './UserDetailsPage.module.scss';
import LoadingIndicator from '../../components/loadingIndicator/LoadingIndicator';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { Link } from 'react-router-dom';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

enum USER_BUTTON_TYPE {
  COMMERCIAL = 'Commercial Users',
  VERIFIED = 'Verified Users',
  ALL = 'All Users',
}

@inject('routing')
@observer
export default class UserDetailsPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable users: UserDTO[] = [];
  @observable loadedUsers = false;
  @observable showUpdateStatusModal = false;
  @observable currentSelected: {
    user: UserDTO | undefined;
    authority: USER_AUTHORITY | undefined;
  } = {
    user: undefined,
    authority: undefined,
  };
  @observable currentSelectedButton = USER_BUTTON_TYPE.VERIFIED;
  @observable currentSelectedFilter: {
    activationKey: string | null | undefined;
    licenseType: string[] | undefined;
  } = {
    activationKey: undefined,
    licenseType: undefined,
  };
  userButtons = [
    USER_BUTTON_TYPE.COMMERCIAL,
    USER_BUTTON_TYPE.VERIFIED,
    USER_BUTTON_TYPE.ALL,
  ];

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.getUsers();
  }

  @action
  async getUsers() {
    try {
      // Hard code the max returned user size. Need to fix pagination issue.
      this.users = await client.getAllUsersUsingGET({ size: 2000 });
      // Display all commerical users by default
      this.toggleFilter(USER_BUTTON_TYPE.VERIFIED);
      this.loadedUsers = true;
    } catch (e) {
      notifyError(e, 'Error fetching users');
    }
  }

  @action
  toggleFilter(button: USER_BUTTON_TYPE) {
    this.currentSelectedButton = button;
    if (this.currentSelectedButton === USER_BUTTON_TYPE.COMMERCIAL) {
      this.currentSelectedFilter = {
        activationKey: null,
        licenseType: [
          LicenseType.HOSPITAL,
          LicenseType.RESEARCH_IN_COMMERCIAL,
          LicenseType.COMMERCIAL,
        ],
      };
    } else if (this.currentSelectedButton === USER_BUTTON_TYPE.VERIFIED) {
      this.currentSelectedFilter = {
        activationKey: null,
        licenseType: undefined,
      };
    } else {
      this.currentSelectedFilter = {
        activationKey: undefined,
        licenseType: undefined,
      };
    }
  }

  @action
  confirmUpdatingUser(user: UserDTO) {
    this.showUpdateStatusModal = true;
    this.currentSelected.user = user;
  }

  @action
  cancelUpdateActiveStatus() {
    this.showUpdateStatusModal = false;
    this.currentSelected.user = undefined;
  }

  @action
  updateActiveStatus(sendEmail = true) {
    this.showUpdateStatusModal = false;
    if (this.currentSelected.user === undefined) {
      notifyError(new Error('No user specified'));
      return;
    }
    this.currentSelected.user.activated = !this.currentSelected.user.activated;
    this.updateUser(this.currentSelected.user, sendEmail);
  }

  @action
  updateUser(updatedUser: UserDTO, sendEmail = false) {
    client
      .updateUserUsingPUT({
        userDto: updatedUser,
        sendEmail,
      })
      .then(() => {
        notifySuccess('Updated');
        this.getUsers();
      })
      .catch((error: Error) => {
        notifyError(error, 'Error updating user');
      });
  }

  @computed
  get currentSelectedUserIsActivated() {
    return (
      this.currentSelected &&
      this.currentSelected.user &&
      this.currentSelected.user.activated
    );
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
    return activated ? 'Activated' : 'Inactivated';
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
      },
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
      },
    },
    {
      id: 'jobTitle',
      Header: <span className={styles.tableHeader}>Job Title</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.jobTitle ? filterByKeyword(data.jobTitle, keyword) : false,
      accessor: 'jobTitle',
    },
    {
      id: 'company',
      Header: <span className={styles.tableHeader}>Company</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.company ? filterByKeyword(data.company, keyword) : false,
      accessor: 'company',
    },
    {
      id: 'city',
      Header: <span className={styles.tableHeader}>City</span>,
      maxWidth: 100,
      onFilter: (data: UserDTO, keyword) =>
        data.city ? filterByKeyword(data.city, keyword) : false,
      accessor: 'city',
    },
    {
      id: 'country',
      Header: <span className={styles.tableHeader}>Country</span>,
      maxWidth: 100,
      onFilter: (data: UserDTO, keyword) =>
        data.country ? filterByKeyword(data.country, keyword) : false,
      accessor: 'country',
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
      },
    },
    {
      id: 'activated',
      Header: <span className={styles.tableHeader}>Status</span>,
      accessor: 'activated',
      minWidth: 120,
      defaultSortDesc: false,
      className: 'justify-content-center',
      sortMethod: defaultSortMethod,
      onFilter: (data: UserDTO, keyword) =>
        filterByKeyword(this.getStatus(data.activated), keyword),
      Cell: (props: { original: UserDTO }) => {
        if (props.original.emailVerified) {
          return (
            <Button
              variant={props.original.activated ? 'success' : 'danger'}
              onClick={() => this.confirmUpdatingUser(props.original)}
            >
              {this.getStatus(props.original.activated)}
            </Button>
          );
        } else {
          return <div>Email hasn&apos;t been verified yet</div>;
        }
      },
    },
    {
      id: 'authorities',
      Header: <span>Profiles</span>,
      accessor: 'authorities',
      minWidth: 160,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      onFilter: (data: UserDTO, keyword) =>
        _.some(data.authorities, authority =>
          filterByKeyword(authority, keyword)
        ),
      Cell(props: { original: UserDTO }) {
        return (
          <div className={'d-flex flex-column'}>
            {props.original.authorities.map(authority => (
              <div>{authority}</div>
            ))}
          </div>
        );
      },
    },
    {
      id: 'licenseType',
      Header: <span className={styles.tableHeader}>License Type</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.licenseType ? filterByKeyword(data.licenseType, keyword) : false,
      accessor: 'licenseType',
    },
    {
      id: 'operations',
      Header: <span className={styles.tableHeader}>Edit</span>,
      minWidth: 60,
      sortable: false,
      className: 'justify-content-center',
      Cell(props: { original: UserDTO }) {
        return (
          <span>
            {isAuthorized(props.original.authorities, [AUTHORITIES.USER]) && (
              <Link to={`/users/${props.original.login}`}>
                <i className="fa fa-pencil-square-o"></i>
              </Link>
            )}
          </span>
        );
      },
    },
  ];

  render() {
    return (
      <>
        {this.loadedUsers ? (
          <>
            <Row className={getSectionClassName(true)}>
              {this.userButtons.map(button => (
                <Col xs={4} className={styles.center}>
                  <Button
                    active={this.currentSelectedButton === button}
                    className={styles.filterButton}
                    onClick={() => this.toggleFilter(button)}
                  >
                    {button}
                  </Button>
                </Col>
              ))}
            </Row>
            <Row className={getSectionClassName()}>
              <Col>
                <OncoKBTable
                  data={this.filteredUser}
                  columns={this.columns}
                  showPagination={true}
                  minRows={1}
                  defaultSorted={[
                    {
                      id: 'createdDate',
                      desc: true,
                    },
                  ]}
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
        <Modal
          show={this.showUpdateStatusModal}
          onHide={() => this.cancelUpdateActiveStatus()}
        >
          <Modal.Header closeButton>
            <Modal.Title>Update User Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure to{' '}
            {this.currentSelectedUserIsActivated ? 'deactivate' : 'active'} the
            user?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => this.cancelUpdateActiveStatus()}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={(event: any) => {
                event.preventDefault();
                this.updateActiveStatus(true);
              }}
            >
              Update
            </Button>
            {!this.currentSelectedUserIsActivated ? (
              <DefaultTooltip
                placement={'top'}
                overlay={
                  'Update user status without sending an email to the user'
                }
              >
                <Button
                  variant="primary"
                  onClick={() => this.updateActiveStatus(false)}
                >
                  Silent Update
                </Button>
              </DefaultTooltip>
            ) : null}
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
