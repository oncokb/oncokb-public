import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import WindowStore from 'app/store/WindowStore';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import { NewCompanyForm } from 'app/components/newCompanyForm/NewCompanyForm';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { CompanyDTO, CompanyVM } from 'app/shared/api/generated/API';
import client from 'app/shared/api/clientInstance';
import { RouterStore } from 'mobx-react-router';
import { notifySuccess } from 'app/shared/utils/NotificationUtils';

enum CreateCompanyStatus {
  CREATE_SUCCESS,
  CREATE_ERROR,
  PENDING,
}

@inject('windowStore', 'routing')
@observer
export class CreateCompanyPage extends React.Component<{
  windowStore: WindowStore;
  routing: RouterStore;
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
      .then(
        (company: CompanyDTO) => this.createCompanySuccess(company.id),
        this.createCompanyFailure
      );
  }

  @action.bound
  createCompanySuccess(companyId: number) {
    notifySuccess('Company created successfully!');
    this.props.routing.history.push(`/companies/${companyId}`);
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
        {this.createCompanyError ? (
          <ErrorAlert error={this.createCompanyError} />
        ) : null}
        <NewCompanyForm onValidSubmit={this.handleValidSubmit} />
      </div>
    );
  }
}
