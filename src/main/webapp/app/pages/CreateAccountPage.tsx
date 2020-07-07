import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import autobind from 'autobind-decorator';
import client from 'app/shared/api/clientInstance';
import { ManagedUserVM, UserDTO } from 'app/shared/api/generated/API';
import { LicenseType } from 'app/config/constants';
import { Alert } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import { NewAccountForm } from 'app/components/newAccountForm/NewAccountForm';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';

enum RegisterStatus {
  REGISTERED,
  NOT_SUCCESS,
  NA
}

@inject('windowStore')
@observer
export class CreateAccountPage extends React.Component<{
  windowStore: WindowStore;
}> {
  @observable registerStatus: RegisterStatus = RegisterStatus.NA;
  @observable registerError: OncoKBError | undefined;
  @observable selectedLicense: LicenseType | undefined;

  @autobind
  @action
  handleValidSubmit(newAccount: Partial<ManagedUserVM>) {
    // Insert an temp password since the model requires the password.
    // The password is ignored at the serverside
    client
      .createUserUsingPOST({
        managedUserVm: {
          ...newAccount,
          password: 'test'
        } as ManagedUserVM
      })
      .then(this.successToRegistered, this.failedToRegistered);
  }

  @action.bound
  successToRegistered() {
    this.registerStatus = RegisterStatus.REGISTERED;
    this.registerError = undefined;
    window.scrollTo(0, 0);
  }

  @action.bound
  failedToRegistered(error: OncoKBError) {
    this.registerStatus = RegisterStatus.NOT_SUCCESS;
    this.registerError = error;
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div>
        {this.registerStatus === RegisterStatus.REGISTERED ? (
          <Alert variant={'info'}>Registered</Alert>
        ) : null}
        {this.registerError ? <ErrorAlert error={this.registerError} /> : null}
        <NewAccountForm
          isLargeScreen={this.props.windowStore.isLargeScreen}
          defaultLicense={this.selectedLicense}
          onSubmit={this.handleValidSubmit}
          byAdmin={true}
        />
      </div>
    );
  }
}
