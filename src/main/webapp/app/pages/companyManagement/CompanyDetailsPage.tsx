import _ from 'lodash';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { observer } from 'mobx-react';
import client from 'app/shared/api/clientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import styles from './CompanyDetailsPage.module.scss';
import { CompanyDTO } from 'app/shared/api/generated/API';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { getSectionClassName } from 'app/pages/account/AccountUtils';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import { filterByKeyword } from 'app/shared/utils/Utils';
import { PAGE_ROUTE } from 'app/config/constants';
import LoadingIndicator, {
  LoaderSize,
} from '../../components/loadingIndicator/LoadingIndicator';
import { Link } from 'react-router-dom';
import { QuickToolButton } from '../userPage/QuickToolButton';

@observer
export default class CompanyDetailsPage extends React.Component {
  readonly companies = remoteData<CompanyDTO[]>({
    invoke() {
      return client.getAllCompaniesUsingGET({});
    },
    onError: (error: Error) => notifyError(error, 'Error fetching companies'),
    default: [],
  });

  private columns: SearchColumn<CompanyDTO>[] = [
    {
      id: 'companyUserCount',
      Header: <span className={styles.tableHeader}>Users</span>,
      minWidth: 60,
      accessor: (data: CompanyDTO) => data.numberOfUsers,
      Cell(props: { original: CompanyDTO }): any {
        return <div>{props.original.numberOfUsers}</div>;
      },
    },
    {
      id: 'companyName',
      Header: <span className={styles.tableHeader}>Company Name</span>,
      minWidth: 120,
      onFilter: (data: CompanyDTO, keyword) =>
        data.name ? filterByKeyword(data.name, keyword) : false,
      accessor: (data: CompanyDTO) => data.name,
      Cell(props: { original: CompanyDTO }): any {
        return <div>{props.original.name}</div>;
      },
    },
    {
      id: 'companyDomains',
      Header: <span className={styles.tableHeader}>Company Domains</span>,
      minWidth: 120,
      sortable: false,
      accessor: 'companyDomains',
      Cell(props: { original: CompanyDTO }): any {
        return <div>{props.original.companyDomains[0]}</div>;
      },
    },
    {
      id: 'licenseModel',
      Header: <span className={styles.tableHeader}>License Model</span>,
      minWidth: 100,
      onFilter: (data: CompanyDTO, keyword) =>
        data.licenseModel ? filterByKeyword(data.licenseModel, keyword) : false,
      accessor: 'licenseModel',
      Cell(props: { original: CompanyDTO }): any {
        return <div>{props.original.licenseModel}</div>;
      },
    },
    {
      id: 'licenseType',
      Header: <span className={styles.tableHeader}>License Type</span>,
      minWidth: 140,
      onFilter: (data: CompanyDTO, keyword) =>
        data.licenseType ? filterByKeyword(data.licenseType, keyword) : false,
      accessor: 'licenseType',
      Cell(props: { original: CompanyDTO }): any {
        return <div>{props.original.licenseType}</div>;
      },
    },
    {
      id: 'licenseStatus',
      Header: <span className={styles.tableHeader}>License Status</span>,
      minWidth: 100,
      onFilter: (data: CompanyDTO, keyword) =>
        data.licenseStatus
          ? filterByKeyword(data.licenseStatus, keyword)
          : false,
      accessor: 'licenseStatus',
      Cell(props: { original: CompanyDTO }): any {
        return <div>{props.original.licenseStatus}</div>;
      },
    },
    {
      id: 'edit',
      Header: <span className={styles.tableHeader}>Edit</span>,
      maxWidth: 60,
      sortable: false,
      className: 'justify-content-center',
      Cell(props: { original: CompanyDTO }) {
        return (
          <span>
            <Link to={`/companies/${props.original.id}`}>
              <i className="fa fa-pencil-square-o"></i>
            </Link>
          </span>
        );
      },
    },
  ];

  render() {
    return (
      <>
        {this.companies.isComplete ? (
          <>
            <Row className={getSectionClassName()}>
              <Col>
                <div>Quick Tools</div>
                <div>
                  <Link to={PAGE_ROUTE.ADMIN_ADD_COMPANY}>
                    <QuickToolButton>Add New Company</QuickToolButton>
                  </Link>
                </div>
              </Col>
            </Row>
            <Row className={getSectionClassName(false)}>
              <Col>
                <OncoKBTable
                  data={this.companies.result}
                  columns={this.columns}
                  showPagination={true}
                  minRows={1}
                  defaultSorted={[
                    {
                      id: 'companyName',
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
            isLoading={this.companies.isPending}
          />
        )}
      </>
    );
  }
}
