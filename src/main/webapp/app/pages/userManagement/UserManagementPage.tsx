import React from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { remoteData } from 'cbioportal-frontend-commons';
import client from 'app/shared/api/clientInstance';
import { UserDTO } from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Button, Row, Col, Badge, ButtonGroup } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';

@inject('routing')
@observer
export default class UserManagementPage extends React.Component<{
  routing: RouterStore
  match: match
}> {

  @action
  updateActiveStatus(currentStatus: boolean) {

  }

  readonly users = remoteData<UserDTO[]>({
    invoke() {
      return client.getAllUsersUsingGET({});
    },
    default: []
  });

  private columns: SearchColumn<UserDTO>[] = [
    {
      id: 'email',
      Header: <span>Email</span>,
      accessor: 'email',
      minWidth: 100,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
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
      Cell(props: { original: UserDTO }) {
        return (
          <Button
            variant={props.original.activated ? 'success' : 'danger'}
            onClick={() => this.updateActiveStatus(props.original.activated)}
          >
            {props.original.activated ? 'Activated' : 'Deactivated'}
          </Button>
        );
      }
    },
    {
      id: 'authorities',
      Header: <span>Profiles</span>,
      accessor: 'authorities',
      minWidth: 160,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell(props: { original: UserDTO }) {
        return (
          <div>
            {props.original.authorities.map(authority => (
              <Badge
                className={'m-1 p-2'}
                variant={'primary'}
                key={authority}>{authority}</Badge>
            ))}
          </div>
        );
      }
    },
    {
      id: 'createdDate',
      Header: <span>Created Date</span>,
      accessor: 'createdDate'
    },
    {
      id: 'lastModifiedBy',
      Header: <span>Last Modified By</span>,
      accessor: 'lastModifiedBy'
    },
    {
      id: 'lastModifiedDate',
      Header: <span>Last Modified Date</span>,
      accessor: 'lastModifiedDate'
    },
    {
      id: 'operations',
      Header: <span></span>,
      minWidth: 200,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell(props: { original: UserDTO }) {
        return (
          <ButtonGroup>
            <Button variant="info">View</Button>
            <Button variant="primary">Edit</Button>
            <Button variant="danger">Delete</Button>
          </ButtonGroup>
        );
      }
    }
  ];

  render() {
    return (
      <>
        <Row className={getSectionClassName(true)}>
          <Col className={'d-flex justify-content-between'}>
            <h2>Users</h2>
            <Button variant={'primary'}>
              <i className={'fa fa-plus mr-1'}/> Create a new user
            </Button>
          </Col>
        </Row>
        <Row className={getSectionClassName()}>
          <Col>
            <OncoKBTable
              data={this.users.result}
              columns={this.columns}
              showPagination={true}
              pageSize={10}
            />
          </Col>
        </Row>
      </>
    );
  }
}
