import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import WindowStore from 'app/store/WindowStore';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import { NewCompanyForm } from 'app/components/newCompanyForm/NewCompanyForm';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { Alert } from 'react-bootstrap';

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
  @observable CreateCompanyStatus: CreateCompanyStatus =
    CreateCompanyStatus.PENDING;
  @observable CreateCompanyError: OncoKBError | undefined;

  @action.bound
  afterCreateCompany(error?: any) {
    error ? this.createCompanyError(error) : this.createCompanySuccess();
  }

  @action.bound
  createCompanySuccess() {
    this.CreateCompanyStatus = CreateCompanyStatus.CREATE_SUCCESS;
    this.CreateCompanyError = undefined;
    window.scrollTo(0, 0);
  }

  @action.bound
  createCompanyError(error: OncoKBError) {
    this.CreateCompanyStatus = CreateCompanyStatus.CREATE_ERROR;
    this.CreateCompanyError = error;
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div>
        {this.CreateCompanyStatus === CreateCompanyStatus.CREATE_SUCCESS ? (
          <Alert variant={'info'}>Company created!</Alert>
        ) : null}
        {this.CreateCompanyError ? (
          <ErrorAlert error={this.CreateCompanyError} />
        ) : null}
        <NewCompanyForm afterCreateCompany={this.afterCreateCompany} />
      </div>
    );
  }
}
