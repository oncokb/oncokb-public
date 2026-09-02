import React from 'react';
import request from 'superagent';
import Select from 'react-select';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Button, Col, Row } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import {
  filterByKeyword,
  formatEnumLabel,
  toAppLocalDateFormat,
} from 'app/shared/utils/Utils';
import {
  AUTHORITIES,
  LicenseType,
  MailCategory,
  USER_AUTHORITIES,
  USER_AUTHORITY,
  USER_MAIL_TAGS,
} from 'app/config/constants';
import styles from './UserDetailsPage.module.scss';
import LoadingIndicator, {
  LoaderSize,
} from '../../components/loadingIndicator/LoadingIndicator';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { Link } from 'react-router-dom';
import { UserStatusModal } from 'app/shared/modal/UserStatusModal';
import {
  getGracePeriodDaysRemaining,
  hasGracePeriodAccess,
} from 'app/shared/utils/GracePeriodUtils';
import { getClientInstanceURL } from 'app/shared/utils/DevUtils';
import { UserQuickViewModal } from './UserQuickViewModal';

type UserAuthorityOption = {
  value: USER_AUTHORITY;
  label: string;
};

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
  @observable isLoadingUsers = false;
  @observable userPage = 0;
  @observable userPageSize = 20;
  @observable userPages = 1;
  @observable userTotalCount = 0;
  @observable searchInput = '';
  @observable searchKeyword = '';
  @observable showUpdateStatusModal = false;
  @observable showQuickViewModal = false;
  @observable currentSelected: {
    user: UserDTO | undefined;
    authority: USER_AUTHORITY | undefined;
  } = {
    user: undefined,
    authority: undefined,
  };
  @observable currentSelectedButton = USER_BUTTON_TYPE.VERIFIED;
  @observable currentSelectedFilter: {
    emailVerified: boolean | undefined;
    licenseTypes: LicenseType[] | undefined;
    roles: USER_AUTHORITY[] | undefined;
  } = {
    emailVerified: undefined,
    licenseTypes: undefined,
    roles: undefined,
  };
  userButtons = [
    USER_BUTTON_TYPE.COMMERCIAL,
    USER_BUTTON_TYPE.VERIFIED,
    USER_BUTTON_TYPE.ALL,
  ];
  private searchDebounceTimeout?: ReturnType<typeof setTimeout>;

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.toggleFilter(USER_BUTTON_TYPE.VERIFIED);
  }

  @action.bound
  async getUsers() {
    this.isLoadingUsers = true;
    try {
      const response = await request
        .post(getClientInstanceURL('api/users/registered'))
        .query({
          page: this.userPage,
          size: this.userPageSize,
        })
        .send({
          q: this.searchKeyword || undefined,
          emailVerified: this.currentSelectedFilter.emailVerified,
          licenseTypes:
            this.currentSelectedFilter.licenseTypes &&
            this.currentSelectedFilter.licenseTypes.length > 0
              ? this.currentSelectedFilter.licenseTypes
              : undefined,
          roles:
            this.currentSelectedFilter.roles &&
            this.currentSelectedFilter.roles.length > 0
              ? this.currentSelectedFilter.roles
              : undefined,
        });

      this.users = response.body || [];
      const totalCount = Number(response.header['x-total-count'] || 0);
      this.userTotalCount = Number.isFinite(totalCount) ? totalCount : 0;
      this.userPages = Math.max(
        1,
        Math.ceil(this.userTotalCount / this.userPageSize)
      );
      this.loadedUsers = true;
    } catch (e) {
      notifyError(e, 'Error fetching users');
    } finally {
      this.isLoadingUsers = false;
    }
  }

  @action.bound
  toggleFilter(button: USER_BUTTON_TYPE) {
    this.currentSelectedButton = button;
    if (this.currentSelectedButton === USER_BUTTON_TYPE.COMMERCIAL) {
      this.currentSelectedFilter = {
        emailVerified: true,
        licenseTypes: [
          LicenseType.HOSPITAL,
          LicenseType.RESEARCH_IN_COMMERCIAL,
          LicenseType.COMMERCIAL,
        ],
        roles: undefined,
      };
    } else if (this.currentSelectedButton === USER_BUTTON_TYPE.VERIFIED) {
      this.currentSelectedFilter = {
        emailVerified: true,
        licenseTypes: undefined,
        roles: undefined,
      };
    } else {
      this.currentSelectedFilter = {
        emailVerified: undefined,
        licenseTypes: undefined,
        roles: undefined,
      };
    }

    this.userPage = 0;
    this.getUsers();
  }

  @action.bound
  updateRoleFilter(selectedOptions: UserAuthorityOption[] | null) {
    this.currentSelectedFilter = {
      ...this.currentSelectedFilter,
      roles:
        selectedOptions && selectedOptions.length > 0
          ? selectedOptions.map(option => option.value)
          : undefined,
    };
    this.userPage = 0;
    this.getUsers();
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
  openQuickViewModal(user: UserDTO) {
    this.showQuickViewModal = true;
    this.currentSelected.user = user;
  }

  @action
  closeQuickViewModal() {
    this.showQuickViewModal = false;
    this.currentSelected.user = undefined;
  }

  @action.bound
  updateQuickViewUserActiveStatus(authorities: string[]) {
    if (this.currentSelected.user === undefined) {
      notifyError(new Error('No user specified'));
      return;
    }

    this.showQuickViewModal = false;
    const userToUpdate: UserDTO = {
      ...this.currentSelected.user,
      activated: !this.currentSelected.user.activated,
      authorities,
    };
    this.updateUser(userToUpdate, true);
  }

  @action.bound
  updateActiveStatus(sendEmail: boolean, authorities: string[]) {
    this.showUpdateStatusModal = false;
    if (this.currentSelected.user === undefined) {
      notifyError(new Error('No user specified'));
      return;
    }
    const userToUpdate: UserDTO = {
      ...this.currentSelected.user,
      activated: !this.currentSelected.user.activated,
      authorities,
    };
    this.updateUser(userToUpdate, sendEmail);
  }

  @action.bound
  async verifyUserEmail(user: UserDTO) {
    try {
      await client.activateAccountUsingGET({
        key: user.activationKey,
      });
      this.getUsers();
      notifySuccess('User email verified');
    } catch (error) {
      return notifyError(error);
    }
  }

  @action
  updateUser(updatedUser: UserDTO, sendEmail = false) {
    client
      .updateUserUsingPUT({
        userDto: updatedUser,
        sendEmail,
        unlinkUser: false,
      })
      .then(() => {
        notifySuccess('Updated');
        this.getUsers();
      })
      .catch((error: Error) => {
        notifyError(error, 'Error updating user.');
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
  get userFromIndex() {
    if (this.userTotalCount === 0 || this.users.length === 0) {
      return 0;
    }
    return this.userPage * this.userPageSize + 1;
  }

  @computed
  get userToIndex() {
    if (this.userTotalCount === 0 || this.users.length === 0) {
      return 0;
    }
    return Math.min(
      this.userTotalCount,
      this.userPage * this.userPageSize + this.users.length
    );
  }

  @action.bound
  handleUsersFetchData(tableState: { page: number; pageSize: number }) {
    this.userPage = tableState.page;
    this.userPageSize = tableState.pageSize;
    this.getUsers();
  }

  @action.bound
  handleUserSearchChange(keyword: string) {
    this.searchInput = keyword;
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }
    this.searchDebounceTimeout = setTimeout(() => {
      this.searchKeyword = this.searchInput;
      this.userPage = 0;
      this.getUsers();
    }, 300);
  }

  private getStatus(activated: boolean) {
    return activated ? 'Activated' : 'Inactivated';
  }

  private getRequestStatusClass(status: UserDTO['accountRequestStatus']) {
    switch (status) {
      case 'APPROVED':
        return styles.requestStatusApproved;
      case 'PENDING':
      case 'PENDING_NO_GRACE_PERIOD':
        return styles.requestStatusPending;
      case 'REJECTED':
        return styles.requestStatusRejected;
      case 'UNKNOWN':
      default:
        return styles.requestStatusUnknown;
    }
  }

  private getGracePeriodActiveLabel(user: UserDTO) {
    if (!hasGracePeriodAccess(user)) {
      return 'No';
    }

    return `Yes (${getGracePeriodDaysRemaining(user)} days)`;
  }

  private getUserMailTags(user: UserDTO) {
    const userMails = user.userMails || [];
    const tags = userMails
      .map(userMail => USER_MAIL_TAGS[userMail.mailType])
      .filter(tag => tag !== undefined);

    return Array.from(new Set(tags));
  }

  private columns: SearchColumn<UserDTO>[] = [
    {
      id: 'quickView',
      Header: '',
      minWidth: 40,
      sortable: false,
      filterable: false,
      className: 'justify-content-center',
      Cell: (props: { original: UserDTO }) => {
        return (
          <Button
            variant="link"
            className="p-0"
            title="Quick view"
            onClick={() => this.openQuickViewModal(props.original)}
          >
            <i className="fa fa-eye"></i>
          </Button>
        );
      },
    },
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
      id: 'companyName',
      Header: <span className={styles.tableHeader}>Company</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.companyName ? filterByKeyword(data.companyName, keyword) : false,
      accessor: 'companyName',
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
      id: 'accountRequestStatus',
      Header: (
        <span className={styles.tableHeader}>Account Request Status</span>
      ),
      accessor: 'accountRequestStatus',
      minWidth: 140,
      defaultSortDesc: false,
      className: 'justify-content-center',
      onFilter: (data: UserDTO, keyword) =>
        filterByKeyword(formatEnumLabel(data.accountRequestStatus), keyword),
      Cell: (props: { original: UserDTO }) => {
        const status = props.original.accountRequestStatus;
        const label = formatEnumLabel(status);
        const className = `${
          styles.requestStatusBadge
        } ${this.getRequestStatusClass(status)}`;
        return <span className={className}>{label}</span>;
      },
    },
    {
      id: 'gracePeriodActive',
      Header: <span className={styles.tableHeader}>Grace Period Active</span>,
      accessor: (user: UserDTO) => user,
      minWidth: 120,
      defaultSortDesc: false,
      sortMethod(a: UserDTO, b: UserDTO) {
        if (a === undefined && b === undefined) {
          return 0;
        }
        if (a === undefined) {
          return 1;
        }
        if (b === undefined) {
          return -1;
        }

        if (hasGracePeriodAccess(a) && !hasGracePeriodAccess(b)) {
          return 1;
        }
        if (!hasGracePeriodAccess(a) && hasGracePeriodAccess(b)) {
          return -1;
        }
        if (!hasGracePeriodAccess(a) && !hasGracePeriodAccess(b)) {
          return 0;
        }

        const aRemainingDays = getGracePeriodDaysRemaining(a);
        const bRemainingDays = getGracePeriodDaysRemaining(b);
        return bRemainingDays - aRemainingDays;
      },
      className: 'justify-content-center',
      onFilter: (data: UserDTO, keyword) =>
        filterByKeyword(this.getGracePeriodActiveLabel(data), keyword),
      Cell: (props: { original: UserDTO }) => {
        return <span>{this.getGracePeriodActiveLabel(props.original)}</span>;
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
          return (
            <>
              <div>Email hasn&apos;t been verified yet</div>
              <Button onClick={() => this.verifyUserEmail(props.original)}>
                Verify
              </Button>
            </>
          );
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
        data.authorities.some(authority => filterByKeyword(authority, keyword)),
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
      id: 'userMails',
      Header: <span className={styles.tableHeader}>Emails Sent to User</span>,
      minWidth: 200,
      sortable: false,
      onFilter: (data: UserDTO, keyword) =>
        this.getUserMailTags(data).some(tag => filterByKeyword(tag, keyword)),
      Cell: (props: { original: UserDTO }) => {
        const tags = this.getUserMailTags(props.original);
        if (tags.length === 0) {
          return <span>—</span>;
        }

        return (
          <div className="d-flex flex-wrap">
            {tags.map(tag => (
              <span key={tag} className="badge badge-info mr-1 mb-1">
                {tag}
              </span>
            ))}
          </div>
        );
      },
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
    const tableFilters: React.FunctionComponent = () => (
      <div style={{ minWidth: '300px' }}>
        {/* sr-only keeps the label available to screen readers while visually hiding it. */}
        {/* This gives react-select an explicit accessible name beyond placeholder text. */}
        <label htmlFor="user-role-filter" className="sr-only">
          Filter users by roles
        </label>
        <Select
          inputId="user-role-filter"
          aria-label="Filter users by roles"
          isMulti
          isClearable
          placeholder={'Filter by roles'}
          options={USER_AUTHORITIES.filter(
            role => role !== USER_AUTHORITY.ROLE_SERVICE_ACCOUNT
          ).map(role => ({ value: role, label: formatEnumLabel(role) }))}
          value={(this.currentSelectedFilter.roles || []).map(role => ({
            value: role,
            label: formatEnumLabel(role),
          }))}
          onChange={(selectedOptions: UserAuthorityOption[] | null) =>
            this.updateRoleFilter(selectedOptions)
          }
        />
      </div>
    );

    return (
      <>
        {this.loadedUsers ? (
          <>
            <Row className={getSectionClassName(true)}>
              {this.userButtons.map(button => (
                <Col xs={4} className={styles.center}>
                  <Button
                    active={this.currentSelectedButton === button}
                    variant="outline-primary"
                    onClick={() => this.toggleFilter(button)}
                  >
                    {button}
                  </Button>
                </Col>
              ))}
            </Row>
            <Row className={getSectionClassName()}>
              <Col className={'d-flex justify-content-end align-items-center'}>
                {`Showing ${this.userFromIndex}-${this.userToIndex} of ${this.userTotalCount}`}
              </Col>
            </Row>
            <Row className={getSectionClassName()}>
              <Col>
                <OncoKBTable
                  data={this.users}
                  columns={this.columns}
                  loading={this.isLoadingUsers}
                  showPagination={true}
                  sortable={false}
                  manual
                  page={this.userPage}
                  pageSize={this.userPageSize}
                  pages={this.userPages}
                  onFetchData={this.handleUsersFetchData}
                  serverSideSearch
                  searchKeyword={this.searchInput}
                  onSearchChange={this.handleUserSearchChange}
                  filters={tableFilters}
                  minRows={1}
                />
              </Col>
            </Row>
          </>
        ) : (
          <LoadingIndicator
            size={LoaderSize.LARGE}
            center={true}
            isLoading={!this.loadedUsers}
          />
        )}
        <UserStatusModal
          show={this.showUpdateStatusModal}
          user={this.currentSelected.user}
          onCancel={() => this.cancelUpdateActiveStatus()}
          onConfirm={this.updateActiveStatus}
        />
        <UserQuickViewModal
          show={this.showQuickViewModal}
          user={this.currentSelected.user}
          onClose={() => this.closeQuickViewModal()}
          onUpdateActiveStatus={this.updateQuickViewUserActiveStatus}
        />
      </>
    );
  }
}
