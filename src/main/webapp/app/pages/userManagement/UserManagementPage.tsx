import React from 'react';
import { action, observable, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import { match } from 'react-router';
import {
  Button,
  Row,
  Col,
  Badge,
  ButtonGroup,
  Modal,
  InputGroup
} from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, {
  SearchColumn
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { ClinicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { filterByKeyword, toAppTimestampFormat } from 'app/shared/utils/Utils';
import _ from 'lodash';
import {
  NOT_CHANGEABLE_AUTHORITIES,
  USER_AUTHORITIES
} from 'app/config/constants';

@inject('routing')
@observer
export default class UserManagementPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable users: UserDTO[] = [];
  @observable showUpdateStatusModal = false;
  @observable showAddAdminModal = false;
  @observable currentSelectedUser: UserDTO | undefined;

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
    this.getUsers();
  }

  @computed
  get currentSelectedUserIsActivated() {
    return this.currentSelectedUser && this.currentSelectedUser.activated;
  }

  @action
  confirmUpdatingUser(user: UserDTO) {
    this.showUpdateStatusModal = true;
    this.currentSelectedUser = user;
  }

  @action
  cancelUpdateActiveStatus() {
    this.showUpdateStatusModal = false;
    this.currentSelectedUser = undefined;
  }

  @action
  confirmAddAdmin(user: UserDTO) {
    this.showAddAdminModal = true;
    this.currentSelectedUser = user;
  }

  @action
  cancelAddAdmin() {
    this.showAddAdminModal = false;
    this.currentSelectedUser = undefined;
  }

  @action
  updateActiveStatus(sendEmail = true) {
    this.showUpdateStatusModal = false;
    if (this.currentSelectedUser === undefined) {
      notifyError(new Error('No user specified'));
      return;
    }
    this.currentSelectedUser.activated = !this.currentSelectedUser.activated;
    this.updateUser(this.currentSelectedUser, sendEmail);
  }

  @action
  addUserAsAdmin() {
    this.showAddAdminModal = false;
    if (this.currentSelectedUser === undefined) {
      notifyError(new Error('No user specified'));
      return;
    }
    this.currentSelectedUser.authorities.push(USER_AUTHORITIES.ROLE_ADMIN);
    this.updateUser(this.currentSelectedUser);
  }

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
        sendEmail
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
      this.users = await client.getAllUsersUsingGET({'size': 2000});
    } catch (e) {
      notifyError(e, 'Error fetching users');
    }
  }

  private getStatus(activated: boolean) {
    return activated ? 'Activated' : 'Deactivated';
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
      }
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
      }
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
        return (
          <div>
            {props.original.authorities.map((authority: USER_AUTHORITIES) => (
              <InputGroup size={'sm'} className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text className={'bg-transparent'}>
                    {authority}
                  </InputGroup.Text>
                </InputGroup.Prepend>
                {NOT_CHANGEABLE_AUTHORITIES.includes(authority) ? null : (
                  <InputGroup.Append>
                    <Button
                      variant={"secondary"}
                      onClick={
                        (event: any) => {
                          event.preventDefault();
                          this.removeAuthority(props.original, authority);
                        }
                      }
                    >
                      <i className={'fa fa-trash'}></i>
                    </Button>
                  </InputGroup.Append>
                )}
              </InputGroup>
            ))}
            {!props.original.authorities.some(
              authority => authority === USER_AUTHORITIES.ROLE_ADMIN
            ) &&
            !props.original.authorities.some(
              authority => authority === USER_AUTHORITIES.ROLE_PUBLIC_WEBSITE
            ) ? (
              <DefaultTooltip
                overlay={'Add user as administrator'}
                placement={'top'}
              >
                <i
                  className={'fa fa-plus-circle ml-2'}
                  onClick={() => this.confirmAddAdmin(props.original)}
                />
              </DefaultTooltip>
            ) : null}
          </div>
        );
      }
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
      }
    },
    {
      id: 'lastModifiedBy',
      Header: <span>Last Modified By</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.lastModifiedBy
          ? filterByKeyword(data.lastModifiedBy, keyword)
          : false,
      accessor: 'lastModifiedBy'
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
      }
    }
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
              onClick={(event:any) => {
                event.preventDefault();
                this.updateActiveStatus(true)
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
        <Modal
          show={this.showAddAdminModal}
          onHide={() => this.cancelAddAdmin()}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add User as Administrator</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure to add user as administrator?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.cancelAddAdmin()}>
              Close
            </Button>
            <Button variant="primary" onClick={(event:any) => {
              event.preventDefault();
              this.addUserAsAdmin()
            }}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
