import React from 'react';
import { action, observable, computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Button, Row, Col, Badge, ButtonGroup, Modal } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { ClinicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { filterByKeyword, toAppTimestampFormat } from 'app/shared/utils/Utils';
import _ from 'lodash';

@inject('routing')
@observer
export default class UserManagementPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable users: UserDTO[] = [];
  @observable showModal = false;
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
    this.showModal = true;
    this.currentSelectedUser = user;
  }

  @action
  cancelUpdateActiveStatus() {
    this.showModal = false;
    this.currentSelectedUser = undefined;
  }

  @action
  updateActiveStatus(sendEmail = true) {
    this.showModal = false;
    if (this.currentSelectedUser === undefined) {
      notifyError(new Error('No user specified'));
      return;
    }
    this.currentSelectedUser.activated = !this.currentSelectedUser.activated;
    client
      .updateUserUsingPUT({
        userDto: this.currentSelectedUser,
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
      this.users = await client.getAllUsersUsingGET({});
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
      onFilter: (data: UserDTO, keyword) => filterByKeyword(data.email, keyword),
      Cell(props: { original: UserDTO }) {
        return <Button variant={'link'}>{props.original.email}</Button>;
      }
    },
    {
      id: 'activated',
      Header: <span>Status</span>,
      accessor: 'activated',
      minWidth: 100,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      onFilter: (data: UserDTO, keyword) => filterByKeyword(this.getStatus(data.activated), keyword),
      Cell: (props: { original: UserDTO }) => {
        if (props.original.emailVerified) {
          return (
            <Button variant={props.original.activated ? 'success' : 'danger'} onClick={() => this.confirmUpdatingUser(props.original)}>
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
      onFilter: (data: UserDTO, keyword) => _.some(data.authorities, authority => filterByKeyword(authority, keyword)),
      Cell(props: { original: UserDTO }) {
        return (
          <div>
            {props.original.authorities.map(authority => (
              <Badge className={'m-1 p-2'} variant={'primary'} key={authority}>
                {authority}
              </Badge>
            ))}
          </div>
        );
      }
    },
    {
      id: 'createdDate',
      Header: <span>Created Date</span>,
      onFilter: (data: UserDTO, keyword) => (data.createdDate ? filterByKeyword(toAppTimestampFormat(data.createdDate), keyword) : false),
      accessor: 'createdDate',
      Cell(props: { original: UserDTO }): any {
        return <div>{toAppTimestampFormat(props.original.createdDate)}</div>;
      }
    },
    {
      id: 'lastModifiedBy',
      Header: <span>Last Modified By</span>,
      onFilter: (data: UserDTO, keyword) => (data.lastModifiedBy ? filterByKeyword(data.lastModifiedBy, keyword) : false),
      accessor: 'lastModifiedBy'
    },
    {
      id: 'lastModifiedDate',
      Header: <span>Last Modified Date</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.lastModifiedDate ? filterByKeyword(toAppTimestampFormat(data.lastModifiedDate), keyword) : false,
      accessor: 'lastModifiedDate',
      Cell(props: { original: UserDTO }): any {
        return <div>{toAppTimestampFormat(props.original.lastModifiedDate)}</div>;
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
            <OncoKBTable data={this.users} columns={this.columns} showPagination={true} pageSize={10} />
          </Col>
        </Row>
        <Modal show={this.showModal} onHide={() => null}>
          <Modal.Header closeButton>
            <Modal.Title>Update User Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure to {this.currentSelectedUserIsActivated ? 'deactivate' : 'active'} the user?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.cancelUpdateActiveStatus()}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.updateActiveStatus(true)}>
              Update
            </Button>
            {!this.currentSelectedUserIsActivated ? (
              <DefaultTooltip placement={'top'} overlay={'Update user status without sending an email to the user'}>
                <Button variant="primary" onClick={() => this.updateActiveStatus(false)}>
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
