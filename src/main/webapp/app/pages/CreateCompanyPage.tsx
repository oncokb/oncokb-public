import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import WindowStore from 'app/store/WindowStore';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import { NewCompanyForm } from 'app/components/newCompanyForm/NewCompanyForm';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { Alert } from 'react-bootstrap';
import { CompanyVM } from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';

enum CreateCompanyStatus {
  CREATE_SUCCESS,
  CREATE_ERROR,
  PENDING,
}

@inject('windowStore')
@observer
export class CreateCompanyPage extends React.Component<{
  windowStore: WindowStore;
}> {
  @observable createCompanyStatus: CreateCompanyStatus =
    CreateCompanyStatus.PENDING;
  @observable createCompanyError: OncoKBError | undefined;

  @action.bound
  handleValidSubmit(newCompany: Partial<CompanyVM>) {
    client
      .createCompanyUsingPOST({
        companyDto: newCompany as CompanyVM,
      })
      .then(this.createCompanySuccess, this.createCompanyFailure);
  }

  @action.bound
  createCompanySuccess() {
    this.createCompanyStatus = CreateCompanyStatus.CREATE_SUCCESS;
    this.createCompanyError = undefined;
    window.scrollTo(0, 0);
  }

  @action.bound
  createCompanyFailure(error: OncoKBError) {
    this.createCompanyStatus = CreateCompanyStatus.CREATE_ERROR;
    this.createCompanyError = error;
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div>
        {this.createCompanyStatus === CreateCompanyStatus.CREATE_SUCCESS ? (
          <Alert variant={'info'}>Company created!</Alert>
        ) : null}
        {this.createCompanyError ? (
          <ErrorAlert error={this.createCompanyError} />
        ) : null}
        <NewCompanyForm onValidSubmit={this.handleValidSubmit} />
      </div>
    );
  }
}
