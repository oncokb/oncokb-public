import React from 'react';
import { action, computed, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Button, Col, InputGroup, Modal, Row } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { filterByKeyword, toAppTimestampFormat } from 'app/shared/utils/Utils';
import _ from 'lodash';
import {
  NOT_CHANGEABLE_AUTHORITIES,
  USER_AUTHORITIES,
  USER_AUTHORITY,
} from 'app/config/constants';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import autobind from 'autobind-decorator';
import LoadingIndicator from '../../components/loadingIndicator/LoadingIndicator';

@inject('routing')
@observer
export default class UserManagementPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable users: UserDTO[] = [];
  @observable loadedUsers = false;
  @observable showUpdateStatusModal = false;
  @observable showAddAuthorityModal = false;
  @observable currentSelected: {
    user: UserDTO | undefined;
    authority: USER_AUTHORITY | undefined;
  } = {
    user: undefined,
    authority: undefined,
  };
  @observable currentSelectedAuthority: UserDTO | undefined;
  @observable modalTitle: string;

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.getUsers();
  }

  @computed
  get currentSelectedUserIsActivated() {
    return (
      this.currentSelected &&
      this.currentSelected.user &&
      this.currentSelected.user.activated
    );
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

  @autobind
  @action
  confirmAddAuthority(user: UserDTO, authority: USER_AUTHORITY) {
    this.showAddAuthorityModal = true;
    this.currentSelected.user = user;
    this.currentSelected.authority = authority;
  }

  @autobind
  @action
  cancelAddAuthority() {
    this.showAddAuthorityModal = false;
    this.currentSelected.user = undefined;
    this.currentSelected.authority = undefined;
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

  @autobind
  @action
  addAuthorityToUser() {
    this.showAddAuthorityModal = false;
    if (this.currentSelected.user === undefined) {
      notifyError(new Error('No user specified'));
      return;
    }
    if (this.currentSelected.authority === undefined) {
      notifyError(new Error('No authority specified'));
      return;
    }
    if (this.currentSelected.authority === USER_AUTHORITY.ROLE_ADMIN) {
      this.currentSelected.user.authorities.push(
        ...[this.currentSelected.authority, USER_AUTHORITY.ROLE_PREMIUM_USER]
      );
    } else {
      this.currentSelected.user.authorities.push(
        this.currentSelected.authority
      );
    }
    this.updateUser(this.currentSelected.user);
  }

  @autobind
  @action
  removeAuthority(user: UserDTO, authorityToBeRemoved: string) {
    user.authorities = user.authorities.filter(
      authority => authority !== authorityToBeRemoved
    );
    this.updateUser(user);
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

  private getStatus(activated: boolean) {
    return activated ? 'Activated' : 'Inactivated';
  }

  private columns: SearchColumn<UserDTO>[] = [
    {
      id: 'email',
      Header: <span>Email</span>,
      accessor: 'email',
      minWidth: 100,
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
      Header: <span>Status</span>,
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
      Cell: (props: { original: UserDTO }) => {
        const authorities = props.original.authorities.includes(
          USER_AUTHORITY.ROLE_PUBLIC_WEBSITE
        )
          ? [USER_AUTHORITY.ROLE_PUBLIC_WEBSITE]
          : USER_AUTHORITIES;
        return (
          <div>
            {authorities.map((authority: USER_AUTHORITY) => {
              return authority !== USER_AUTHORITY.ROLE_PUBLIC_WEBSITE ||
                props.original.authorities.includes(
                  USER_AUTHORITY.ROLE_PUBLIC_WEBSITE
                ) ? (
                <ActionInputGroup
                  icon={
                    props.original.authorities.includes(authority)
                      ? 'trash'
                      : 'plus-circle'
                  }
                  type={
                    props.original.authorities.includes(authority)
                      ? 'danger'
                      : 'success'
                  }
                  text={authority}
                  onClick={
                    props.original.authorities.includes(authority)
                      ? !NOT_CHANGEABLE_AUTHORITIES.includes(authority)
                        ? (event: any) => {
                            this.removeAuthority(props.original, authority);
                          }
                        : undefined
                      : !NOT_CHANGEABLE_AUTHORITIES.includes(authority)
                      ? () =>
                          this.confirmAddAuthority(props.original, authority)
                      : undefined
                  }
                />
              ) : undefined;
            })}
          </div>
        );
      },
    },
    {
      id: 'createdDate',
      Header: <span>Created Date</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.createdDate
          ? filterByKeyword(toAppTimestampFormat(data.createdDate), keyword)
          : false,
      accessor: 'createdDate',
      Cell(props: { original: UserDTO }): any {
        return <div>{toAppTimestampFormat(props.original.createdDate)}</div>;
      },
    },
    {
      id: 'lastModifiedBy',
      Header: <span>Last Modified By</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.lastModifiedBy
          ? filterByKeyword(data.lastModifiedBy, keyword)
          : false,
      accessor: 'lastModifiedBy',
    },
    {
      id: 'lastModifiedDate',
      Header: <span>Last Modified Date</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.lastModifiedDate
          ? filterByKeyword(
              toAppTimestampFormat(data.lastModifiedDate),
              keyword
            )
          : false,
      accessor: 'lastModifiedDate',
      Cell(props: { original: UserDTO }): any {
        return (
          <div>{toAppTimestampFormat(props.original.lastModifiedDate)}</div>
        );
      },
    },
    // {
    //   id: 'operations',
    //   Header: <span></span>,
    //   width: 180,
    //   defaultSortDesc: false,
    //   sortMethod: defaultSortMethod,
    //   Cell(props: { original: UserDTO }) {
    //     return (
    //       <ButtonGroup>
    //         <Button variant="info">View</Button>
    //         <Button variant="primary">Edit</Button>
    //         <Button variant="danger">Delete</Button>
    //       </ButtonGroup>
    //     );
    //   }
    // }
  ];

  render() {
    return (
      <>
        {this.loadedUsers ? (
          <>
            <Row className={getSectionClassName(true)}>
              <Col className={'d-flex justify-content-between'}>
                <h2>Users</h2>
              </Col>
            </Row>
            <Row className={getSectionClassName()}>
              <Col>
                <OncoKBTable
                  data={this.users}
                  columns={this.columns}
                  showPagination={true}
                  minRows={1}
                />
              </Col>
            </Row>
            <Modal
              show={this.showUpdateStatusModal}
              onHide={() => this.cancelUpdateActiveStatus()}
            >
              <Modal.Header closeButton>
                <Modal.Title>Update User Status</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure to{' '}
                {this.currentSelectedUserIsActivated ? 'deactivate' : 'active'}{' '}
                the user?
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
            <SimpleConfirmModal
              show={this.showAddAuthorityModal}
              title={`Add authority ${this.currentSelected.authority}?`}
              onConfirm={this.addAuthorityToUser}
              onCancel={this.cancelAddAuthority}
            ></SimpleConfirmModal>
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

const ActionInputGroup: React.FunctionComponent<{
  type: 'success' | 'danger';
  icon: string;
  text: string;
  onClick?: (event: any) => void;
}> = props => {
  return (
    <InputGroup size={'sm'} className="mb-3">
      <InputGroup.Prepend>
        <InputGroup.Text className={'bg-transparent'}>
          {props.text}
        </InputGroup.Text>
      </InputGroup.Prepend>
      {props.onClick ? (
        <InputGroup.Append>
          <Button variant={props.type} onClick={props.onClick}>
            <i className={`fa fa-${props.icon}`}></i>
          </Button>
        </InputGroup.Append>
      ) : null}
    </InputGroup>
  );
};
