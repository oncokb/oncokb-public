import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import React from 'react';
import { Token, UserDTO } from 'app/shared/api/generated/API';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { filterByKeyword, toAppLocalDateFormat } from 'app/shared/utils/Utils';
import { Link } from 'react-router-dom';
import { COLOR_PRIMARY } from 'app/config/theme';
import _ from 'lodash';
import client from '../api/clientInstance';
import { notifyError, notifySuccess } from '../utils/NotificationUtils';
import { Button } from 'react-bootstrap';
import { action } from 'mobx';
import { LicenseStatus } from 'app/config/constants';
import InfoIcon from '../icons/InfoIcon';

type IUserTableProps = {
  data: UserDTO[];
  usersTokens: Token[];
  onRemoveUser: (userToRemove: UserDTO) => void;
  onUpdateUser: (updatedUser: UserDTO) => void;
};

export class UserTable extends React.Component<IUserTableProps> {
  @action.bound
  async updateUser(
    userToUpdate: UserDTO,
    sendEmail = false,
    unlinkUser = false,
    updateCallback: (updatedUser: UserDTO) => void
  ) {
    try {
      const updatedUser = await client.updateUserUsingPUT({
        userDto: userToUpdate,
        sendEmail,
        unlinkUser,
      });
      updateCallback(updatedUser);
      notifySuccess('User updated!');
    } catch (error) {
      notifyError(error, 'Error updating user!');
    }
  }

  @action.bound
  unlinkUserFromCompany(user: UserDTO) {
    const userToUpdate: UserDTO = { ...user };
    this.updateUser(userToUpdate, false, true, (updatedUser: UserDTO) =>
      this.props.onRemoveUser(updatedUser)
    );
  }

  @action.bound
  alignUserLicenseStatus(user: UserDTO) {
    if (user.licenseType !== user.company.licenseType) {
      const userToUpdate: UserDTO = {
        ...user,
        licenseType: user.company.licenseType,
      };
      this.updateUser(userToUpdate, false, false, this.props.onUpdateUser);
    }
  }

  isUserOnTrial(user: UserDTO) {
    if (user.company.licenseStatus === LicenseStatus.TRIAL) {
      if (
        this.props.usersTokens.some(
          token => token.user.id === user.id && !token.renewable
        )
      ) {
        return ' (Trial)';
      } else if (
        !user.additionalInfo?.trialAccount?.activation?.activationDate &&
        user.additionalInfo?.trialAccount?.activation?.key
      ) {
        return ' (Pending)';
      } else {
        return ' (Regular)';
      }
    }
  }

  private columns: SearchColumn<UserDTO>[] = [
    {
      id: 'createdDate',
      Header: <span>Created Date</span>,
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
      Header: <span>User Name</span>,
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
      Header: <span>Job Title</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.jobTitle ? filterByKeyword(data.jobTitle, keyword) : false,
      accessor: 'jobTitle',
    },
    {
      id: 'email',
      Header: <span>Email</span>,
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
      Header: (
        <>
          <span>Status</span>
          <InfoIcon
            placement={'top'}
            overlay={
              <>
                <div>
                  <strong>Trial:</strong> User has activated their trial
                  license.
                </div>
                <div>
                  <strong>Pending:</strong> Waiting for user to activate trial.
                </div>
                <div>
                  <strong>Regular:</strong> User is on a regular license.
                </div>
              </>
            }
            className={'ml-2'}
          />
        </>
      ),
      accessor: 'activated',
      defaultSortDesc: false,
      className: 'justify-content-center',
      sortMethod: defaultSortMethod,
      Cell: (props: { original: UserDTO }) => {
        return (
          <span>
            {props.original.activated ? 'Activated' : 'Inactivated'}
            {this.isUserOnTrial(props.original)}
          </span>
        );
      },
    },
    {
      id: 'authorities',
      Header: <span>Profiles</span>,
      accessor: 'authorities',
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
              <div key={authority}>{authority}</div>
            ))}
          </div>
        );
      },
    },
    {
      id: 'licenseType',
      Header: <span>License Type</span>,
      onFilter: (data: UserDTO, keyword) =>
        data.licenseType ? filterByKeyword(data.licenseType, keyword) : false,
      accessor: 'licenseType',
      Cell: (props: { original: UserDTO }) => {
        if (props.original.licenseType !== props.original.company.licenseType) {
          return (
            <Button
              variant={'danger'}
              onClick={() => this.alignUserLicenseStatus(props.original)}
            >
              {props.original.licenseType}
            </Button>
          );
        }
        return <span>{props.original.licenseType}</span>;
      },
    },
    {
      id: 'edit',
      Header: <span>Edit</span>,
      maxWidth: 60,
      sortable: false,
      className: 'justify-content-center',
      Cell(props: { original: UserDTO }) {
        return (
          <span>
            <Link to={`/users/${props.original.login}`}>
              <i className="fa fa-pencil-square-o"></i>
            </Link>
          </span>
        );
      },
    },
    {
      id: 'unlink',
      Header: <span>Unlink</span>,
      maxWidth: 60,
      sortable: false,
      className: 'justify-content-center',
      Cell: (props: { original: UserDTO }) => {
        return (
          <span
            style={{ color: COLOR_PRIMARY, cursor: 'pointer' }}
            onClick={() => this.unlinkUserFromCompany(props.original)}
          >
            <i className="fa fa-user-times"></i>
          </span>
        );
      },
    },
  ];

  render() {
    return (
      <OncoKBTable
        defaultSorted={[
          {
            id: 'createdDate',
            desc: true,
          },
        ]}
        data={this.props.data}
        columns={this.columns}
        showPagination={true}
        minRows={1}
      />
    );
  }
}
