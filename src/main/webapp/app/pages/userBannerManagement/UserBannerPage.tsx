import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import client from 'app/shared/api/clientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import styles from './UserBannerPage.module.scss';
import { UserBannerMessageDTO } from 'app/shared/api/generated/API';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { PAGE_ROUTE } from 'app/config/constants';
import LoadingIndicator, {
  LoaderSize,
} from '../../components/loadingIndicator/LoadingIndicator';
import { Link } from 'react-router-dom';
import { QuickToolButton } from '../userPage/QuickToolButton';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import { UserBannerStatusBadge } from 'app/components/userBannerStatus/UserBannerStatusBadge';

@observer
export default class UserBannerPage extends React.Component {
  readonly bannerMessagesRequest = remoteData<UserBannerMessageDTO[]>({
    invoke() {
      return client.getAllUserBannerMessagesUsingGET({});
    },
    onError: (error: Error) =>
      notifyError(error, 'Error fetching banner messages'),
    onResult: this.handleBannerMessagesResult,
    default: [],
  });

  @observable.ref bannerMessages: UserBannerMessageDTO[] = [];

  @observable showDeleteConfirmModal = false;

  @observable deletingBannerMessage = false;

  @observable bannerMessagePendingDeletion?: UserBannerMessageDTO;

  @action.bound
  private handleBannerMessagesResult(messages: UserBannerMessageDTO[] = []) {
    this.bannerMessages = messages;
  }

  @action.bound
  private openDeleteConfirmModal(message: UserBannerMessageDTO) {
    this.bannerMessagePendingDeletion = message;
    this.showDeleteConfirmModal = true;
  }

  @action.bound
  private closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.bannerMessagePendingDeletion = undefined;
    this.deletingBannerMessage = false;
  }

  @action.bound
  private deleteBannerMessage() {
    if (!this.bannerMessagePendingDeletion?.id) {
      return;
    }
    this.deletingBannerMessage = true;
    const { id } = this.bannerMessagePendingDeletion;
    client.deleteUserBannerMessageUsingDELETE({ id }).then(
      action(() => {
        notifySuccess('Banner message deleted successfully');
        this.bannerMessages = this.bannerMessages.filter(
          bannerMessage => bannerMessage.id !== id
        );
        this.closeDeleteConfirmModal();
        window.location.reload(false);
      }),
      error => {
        notifyError(error, 'Error deleting banner message');
        this.deletingBannerMessage = false;
      }
    );
  }

  private columns: SearchColumn<UserBannerMessageDTO>[] = [
    {
      id: 'id',
      Header: <span className={styles.tableHeader}>ID</span>,
      accessor: 'id',
    },
    {
      id: 'bannerType',
      Header: <span className={styles.tableHeader}>Banner Type</span>,
      minWidth: 60,
      accessor: 'bannerType',
    },
    {
      id: 'status',
      Header: <span className={styles.tableHeader}>Status</span>,
      minWidth: 90,
      accessor: 'status',
      Cell: (props: { original: UserBannerMessageDTO }) => (
        <UserBannerStatusBadge status={props.original.status} />
      ),
      onFilter: (data: UserBannerMessageDTO, keyword: string) =>
        (data.status ?? '')
          .toLowerCase()
          .includes(keyword.trim().toLowerCase()),
    },
    {
      id: 'edit',
      Header: <span className={styles.tableHeader}>Edit</span>,
      maxWidth: 60,
      sortable: false,
      className: 'justify-content-center',
      Cell: (props: { original: UserBannerMessageDTO }) => (
        <span>
          <Link to={`/admin/user-banner-messages/${props.original.id}`}>
            <i className="fa fa-pencil-square-o"></i>
          </Link>
        </span>
      ),
    },
    {
      id: 'delete',
      Header: <span className={styles.tableHeader}>Delete</span>,
      maxWidth: 60,
      sortable: false,
      className: 'justify-content-center',
      Cell: (props: { original: UserBannerMessageDTO }) => (
        <Button
          variant="link"
          className="p-0 text-danger"
          aria-label={`Delete banner message ${props.original.id}`}
          onClick={() => this.openDeleteConfirmModal(props.original)}
        >
          <i className="fa fa-trash" />
        </Button>
      ),
    },
  ];

  render() {
    return (
      <>
        <SimpleConfirmModal
          show={this.showDeleteConfirmModal}
          title="Delete Banner Message"
          body={
            <div>
              Are you sure you want to delete banner message{' '}
              {this.bannerMessagePendingDeletion?.id}?
            </div>
          }
          confirmDisabled={this.deletingBannerMessage}
          onCancel={this.closeDeleteConfirmModal}
          onConfirm={this.deleteBannerMessage}
        />
        {this.bannerMessagesRequest.isComplete ? (
          <>
            <Row className={getSectionClassName()}>
              <Col>
                <div>Quick Tools</div>
                <div>
                  <Link to={PAGE_ROUTE.ADMIN_ADD_USER_BANNER_MESSAGE}>
                    <QuickToolButton>Add User Banner Message</QuickToolButton>
                  </Link>
                </div>
              </Col>
            </Row>
            <Row className={getSectionClassName(false)}>
              <Col>
                <OncoKBTable
                  data={this.bannerMessages}
                  columns={this.columns}
                  showPagination={true}
                  minRows={1}
                  defaultSorted={[
                    {
                      id: 'id',
                      desc: true,
                    },
                  ]}
                />
              </Col>
            </Row>
          </>
        ) : (
          <LoadingIndicator
            size={LoaderSize.LARGE}
            center={true}
            isLoading={this.bannerMessagesRequest.isPending}
          />
        )}
      </>
    );
  }
}
