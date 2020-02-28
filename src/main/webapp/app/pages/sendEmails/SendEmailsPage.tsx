import React from 'react';
import {
  action,
  observable,
  computed,
  IReactionDisposer,
  reaction
} from 'mobx';
import { observer, inject } from 'mobx-react';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { remoteData } from 'cbioportal-frontend-commons';
import client from 'app/shared/api/clientInstance';
import {
  MailTypeInfo,
  UserDTO,
  UserMailsDTO
} from 'app/shared/api/generated/API';
import { match } from 'react-router';
import { Row, Col } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import OncoKBTable, {
  SearchColumn
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { filterByKeyword, toAppTimestampFormat } from 'app/shared/utils/Utils';
import _ from 'lodash';
import { COMPONENT_PADDING, ONCOKB_LICENSE_EMAIL } from 'app/config/constants';
import pluralize from 'pluralize';
import Select from 'react-select';
import classnames from 'classnames';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import AuthenticationStore from 'app/store/AuthenticationStore';
import autobind from 'autobind-decorator';
import { LoadingButton } from 'app/shared/button/LoadingButton';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import { Else, If, Then } from 'react-if';

@inject('routing', 'authenticationStore')
@observer
export default class UserManagementPage extends React.Component<{
  routing: RouterStore;
  authenticationStore: AuthenticationStore;
  match: match;
}> {
  @observable sendingMail: false;
  @observable selectedUserLogin: string;
  @observable selectedMailFrom: string | undefined;
  @observable selectedMailCc: string | undefined;
  @observable selectedMailType: MailTypeInfo | undefined;
  @observable showConfirmModal = false;
  @observable userMails: UserMailsDTO[] = [];
  @observable showUpdateStatusModal = false;
  @observable showAddAuthorityModal = false;
  readonly reactions: IReactionDisposer[] = [];

  constructor(
    props: Readonly<{
      routing: RouterStore;
      authenticationStore: AuthenticationStore;
      match: match;
    }>
  ) {
    super(props);
    this.reactions.push(
      reaction(
        () => this.selectedUserLogin,
        newUserLogin => {
          this.getUserMails();
          this.selectedMailType = undefined;
          this.selectedMailFrom = undefined;
          this.selectedMailCc = undefined;
        }
      )
    );
  }

  @autobind
  @action
  sendEmail() {
    if (this.canSendEmail) {
      client
        .sendUserMailsUsingPOST({
          to: this.selectedUserLogin,
          from: this.selectedMailFrom!,
          cc: this.selectedMailCc,
          by: this.props.authenticationStore.account!.login,
          mailType: this.selectedMailType!.mailType
        })
        .then(() => {
          notifySuccess('Sent the email.');
          // for some reason, the cache is not updated
          this.getUserMails();
        })
        .catch(e => {
          notifyError(e);
        });
    }
  }

  @autobind
  @action
  async getUserMails() {
    this.userMails = await client.getUsersUserMailsUsingGET({
      login: this.selectedUserLogin
    });
  }

  @computed
  get canSendEmail() {
    return (
      this.selectedMailFrom && this.selectedMailType && this.selectedUserLogin
    );
  }

  @computed
  get selectedUser() {
    return _.chain(this.users.result)
      .filter(user => user.login === this.selectedUserLogin)
      .first()
      .value();
  }

  readonly users = remoteData<UserDTO[]>({
    invoke() {
      return client.getAllUsersUsingGET({ size: 2000 });
    },
    default: []
  });

  readonly mailTypes = remoteData<MailTypeInfo[]>({
    invoke: async () => {
      if (this.selectedUser === undefined) {
        return [];
      } else {
        return await client.getMailsTypesUsingGET({
          licenseType: this.selectedUser.licenseType
        });
      }
    },
    default: []
  });

  readonly mailsFrom = remoteData<string[]>({
    invoke() {
      return client.getMailsFromUsingGET({});
    },
    default: []
  });

  private columns: SearchColumn<UserMailsDTO>[] = [
    {
      id: 'mailType',
      Header: <span>Mail Type</span>,
      accessor: 'mailType',
      minWidth: 100,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      onFilter: (data: UserMailsDTO, keyword) =>
        filterByKeyword(data.mailType, keyword)
    },
    {
      id: 'sentDate',
      Header: <span>Sent Date</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentDate
          ? filterByKeyword(toAppTimestampFormat(data.sentDate), keyword)
          : false,
      accessor: 'createdDate',
      Cell(props: { original: UserMailsDTO }): any {
        return <div>{toAppTimestampFormat(props.original.sentDate)}</div>;
      }
    },
    {
      id: 'sentFrom',
      Header: <span>Sent From</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentFrom ? filterByKeyword(data.sentFrom, keyword) : false,
      accessor: 'sentFrom'
    },
    {
      id: 'sentBy',
      Header: <span>Sent By</span>,
      onFilter: (data: UserMailsDTO, keyword) =>
        data.sentBy ? filterByKeyword(data.sentBy, keyword) : false,
      accessor: 'sentBy'
    }
  ];

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  render() {
    return (
      <If condition={this.users.isComplete}>
        <Then>
          <Row className={getSectionClassName(true)}>
            <Col className={'d-flex justify-content-between'}>
              <h2>Send Emails</h2>
            </Col>
          </Row>
          <Row className={getSectionClassName()}>
            <Col className={classnames(...COMPONENT_PADDING)} lg={6} xs={12}>
              <div>
                <div className={'pb-2'}>To</div>
                <Select
                  value={
                    this.selectedUserLogin
                      ? {
                          value: this.selectedUserLogin,
                          label: this.selectedUserLogin
                        }
                      : null
                  }
                  options={this.users.result.map(user => {
                    return {
                      value: user.login,
                      label: user.login
                    };
                  })}
                  isClearable={true}
                  onChange={(selectedOption: any) => {
                    this.selectedUserLogin = selectedOption
                      ? selectedOption.value
                      : '';
                  }}
                />
              </div>
            </Col>
            <Col className={classnames(...COMPONENT_PADDING)} lg={6} xs={12}>
              <div>
                <div className={'pb-2'}>From</div>
                <Select
                  value={
                    this.selectedMailFrom
                      ? {
                          value: this.selectedMailFrom,
                          label: this.selectedMailFrom
                        }
                      : null
                  }
                  options={this.mailsFrom.result.map(from => {
                    return {
                      value: from,
                      label: from
                    };
                  })}
                  isClearable={true}
                  onChange={(selectedOption: any) =>
                    (this.selectedMailFrom = selectedOption
                      ? selectedOption.value
                      : '')
                  }
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col className={classnames(...COMPONENT_PADDING)} lg={6} xs={12}>
              <Select
                placeholder={`Select the type of mail`}
                value={
                  this.selectedMailType
                    ? {
                        value: this.selectedMailType.mailType,
                        label: this.selectedMailType.description
                      }
                    : null
                }
                options={this.mailTypes.result.map(type => {
                  return {
                    value: type.mailType,
                    label: type.description
                  };
                })}
                isClearable={true}
                onChange={(selectedOption: any) =>
                  (this.selectedMailType = selectedOption
                    ? {
                        mailType: selectedOption.value,
                        description: selectedOption.label
                      }
                    : undefined)
                }
              />
            </Col>
            <Col className={classnames(...COMPONENT_PADDING)} lg={6} xs={12}>
              <LoadingButton
                variant="primary"
                type="submit"
                disabled={!this.canSendEmail}
                onClick={() => (this.showConfirmModal = true)}
                loading={this.sendingMail}
              >
                Send
              </LoadingButton>
            </Col>
          </Row>
          {this.selectedUserLogin && (
            <>
              <Row className={getSectionClassName()}>
                <Col className={'d-flex justify-content-between'}>
                  <h2>Previous Emails Sent</h2>
                </Col>
              </Row>
              <Row className={getSectionClassName()}>
                <Col>
                  {this.userMails && (
                    <OncoKBTable
                      defaultSorted={[
                        {
                          id: 'sentDate',
                          desc: true
                        }
                      ]}
                      data={this.userMails}
                      columns={this.columns}
                      showPagination={true}
                      minRows={1}
                    />
                  )}
                </Col>
              </Row>
            </>
          )}
          <SimpleConfirmModal
            onCancel={() => (this.showConfirmModal = false)}
            onConfirm={() => {
              this.sendEmail();
              this.showConfirmModal = false;
            }}
            show={this.showConfirmModal}
          />
        </Then>
        <Else>
          <LoadingIndicator size={'big'} center={true} isLoading />
        </Else>
      </If>
    );
  }
}
