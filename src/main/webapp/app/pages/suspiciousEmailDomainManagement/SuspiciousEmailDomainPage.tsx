import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import client from 'app/shared/api/clientInstance';
import {
  SuspiciousEmailDomainCreateDTO,
  SuspiciousEmailDomainDTO,
} from 'app/shared/api/generated/API';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import { filterByKeyword } from 'app/shared/utils/Utils';
import { SimpleConfirmModal } from 'app/shared/modal/SimpleConfirmModal';
import styles from './SuspiciousEmailDomainPage.module.scss';

type SuspiciousEmailDomain = SuspiciousEmailDomainDTO;

@observer
export default class SuspiciousEmailDomainPage extends React.Component {
  @observable.ref suspiciousEmailDomains: SuspiciousEmailDomain[] = [];
  @observable isLoading = false;
  @observable domain = '';
  @observable justification = '';
  @observable editingId?: number;
  @observable showDeleteModal = false;
  @observable deleting = false;
  @observable pendingDelete?: SuspiciousEmailDomain;

  componentDidMount() {
    this.fetchSuspiciousEmailDomains();
  }

  @action.bound
  fetchSuspiciousEmailDomains() {
    this.isLoading = true;
    client
      .getAllSuspiciousEmailDomainsUsingGET({})
      .then(response => {
        this.suspiciousEmailDomains = response || [];
      })
      .catch(error => notifyError(error, 'Error fetching suspicious domains'))
      .finally(
        action(() => {
          this.isLoading = false;
        })
      );
  }

  @action.bound
  resetForm() {
    this.domain = '';
    this.justification = '';
    this.editingId = undefined;
  }

  @action.bound
  onEdit(item: SuspiciousEmailDomain) {
    this.editingId = item.id;
    this.domain = item.domain;
    this.justification = item.justification;
  }

  @action.bound
  onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const domain = this.domain.trim().toLowerCase();
    const justification = this.justification.trim();
    if (!domain || !justification) {
      return;
    }

    const submitRequest = this.editingId
      ? client.updateSuspiciousEmailDomainUsingPUT({
          suspiciousEmailDomainDto: {
            id: this.editingId,
            domain,
            justification,
          },
        })
      : (() => {
          const createDto: SuspiciousEmailDomainCreateDTO = {
            domain,
            justification,
          };
          return client.createSuspiciousEmailDomainUsingPOST({
            suspiciousEmailDomainDto: createDto,
          });
        })();

    submitRequest
      .then(() => {
        notifySuccess(
          this.editingId
            ? 'Suspicious domain updated successfully'
            : 'Suspicious domain created successfully'
        );
        this.resetForm();
        this.fetchSuspiciousEmailDomains();
      })
      .catch(error => {
        notifyError(error, 'Error saving suspicious domain');
      });
  }

  @action.bound
  openDeleteModal(item: SuspiciousEmailDomain) {
    this.pendingDelete = item;
    this.showDeleteModal = true;
  }

  @action.bound
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.pendingDelete = undefined;
    this.deleting = false;
  }

  @action.bound
  deleteSuspiciousDomain() {
    if (!this.pendingDelete?.id) {
      return;
    }

    this.deleting = true;
    client
      .deleteSuspiciousEmailDomainUsingDELETE({ id: this.pendingDelete.id })
      .then(() => {
        notifySuccess('Suspicious domain deleted successfully');
        this.closeDeleteModal();
        this.fetchSuspiciousEmailDomains();
      })
      .catch(error => {
        notifyError(error, 'Error deleting suspicious domain');
        this.deleting = false;
      });
  }

  private columns: SearchColumn<SuspiciousEmailDomain>[] = [
    {
      id: 'id',
      Header: <span className={styles.tableHeader}>ID</span>,
      accessor: 'id',
      maxWidth: 80,
    },
    {
      id: 'domain',
      Header: <span className={styles.tableHeader}>Domain</span>,
      accessor: 'domain',
      minWidth: 180,
      onFilter: (data, keyword) => filterByKeyword(data.domain, keyword),
    },
    {
      id: 'justification',
      Header: <span className={styles.tableHeader}>Justification</span>,
      accessor: 'justification',
      minWidth: 320,
      onFilter: (data, keyword) => filterByKeyword(data.justification, keyword),
    },
    {
      id: 'edit',
      Header: <span className={styles.tableHeader}>Edit</span>,
      maxWidth: 60,
      sortable: false,
      className: 'justify-content-center',
      Cell: (props: { original: SuspiciousEmailDomain }) => (
        <Button
          variant="link"
          className="p-0"
          title="Edit suspicious domain"
          aria-label="Edit suspicious domain"
          onClick={() => this.onEdit(props.original)}
        >
          <i className="fa fa-pencil-square-o" aria-hidden="true" />
        </Button>
      ),
    },
    {
      id: 'delete',
      Header: <span className={styles.tableHeader}>Delete</span>,
      maxWidth: 80,
      sortable: false,
      className: 'justify-content-center',
      Cell: (props: { original: SuspiciousEmailDomain }) => (
        <Button
          variant="link"
          className="p-0 text-danger"
          title="Delete suspicious domain"
          aria-label="Delete suspicious domain"
          onClick={() => this.openDeleteModal(props.original)}
        >
          <i className="fa fa-trash" aria-hidden="true" />
        </Button>
      ),
    },
  ];

  render() {
    const submitDisabled =
      this.domain.trim().length === 0 || this.justification.trim().length === 0;

    return (
      <>
        <SimpleConfirmModal
          show={this.showDeleteModal}
          title="Delete Suspicious Domain"
          body={
            <div>
              Are you sure you want to delete suspicious domain{' '}
              <strong>{this.pendingDelete?.domain}</strong>?
            </div>
          }
          confirmDisabled={this.deleting}
          onCancel={this.closeDeleteModal}
          onConfirm={this.deleteSuspiciousDomain}
        />
        <Row className={getSectionClassName()}>
          <Col>
            <h5>Manage Suspicious Email Domains</h5>
            <Form onSubmit={this.onSubmit} className="mt-3">
              <Form.Group>
                <Form.Label className="font-weight-bold">Domain</Form.Label>
                <Form.Control
                  value={this.domain}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.domain = event.target.value;
                  }}
                  placeholder="example.com"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="font-weight-bold">
                  Justification
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  maxLength={2000}
                  value={this.justification}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    this.justification = event.target.value;
                  }}
                  placeholder="Reason this domain should be flagged"
                />
              </Form.Group>
              <div className="d-flex">
                <Button type="submit" disabled={submitDisabled}>
                  {this.editingId ? 'Update Domain' : 'Add Domain'}
                </Button>
                {this.editingId ? (
                  <Button
                    variant="secondary"
                    className="ml-2"
                    onClick={this.resetForm}
                  >
                    Cancel Edit
                  </Button>
                ) : null}
              </div>
            </Form>
          </Col>
        </Row>
        <Row className={getSectionClassName(false)}>
          <Col>
            <OncoKBTable
              data={this.suspiciousEmailDomains}
              columns={this.columns}
              loading={this.isLoading}
              showPagination
              minRows={1}
              defaultSorted={[{ id: 'id', desc: true }]}
            />
          </Col>
        </Row>
      </>
    );
  }
}
