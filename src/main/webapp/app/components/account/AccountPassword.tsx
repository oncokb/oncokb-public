import React from 'react';
import { RouterStore } from 'mobx-react-router';
import * as QueryString from 'query-string';
import client from 'app/shared/api/clientInstance';
import { observable } from 'mobx';
import { Link } from 'react-router-dom';
import { API_CALL_STATUS, PAGE_ROUTE } from 'app/config/constants';
import { inject, observer } from 'mobx-react';
import { Alert, Button } from 'react-bootstrap';
import SmallPageContainer from '../SmallPageContainer';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import PasswordStrengthBar from 'app/shared/password/password-strength-bar';
import { getErrorMessage, OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';

@observer
export default class AccountPassword extends React.Component<{}> {
  @observable currentPassword = '';
  @observable newPassword = '';
  @observable resetStatus: API_CALL_STATUS;
  @observable error: Error;

  handleSavePassword = (event: any, values: any) => {
    client
      .changePasswordUsingPOST({
        passwordChangeDto: {
          newPassword: this.newPassword,
          currentPassword: this.currentPassword,
        },
      })
      .then(() => {
        this.resetStatus = API_CALL_STATUS.SUCCESSFUL;
      })
      .catch((error: OncoKBError) => {
        this.error = error;
        this.resetStatus = API_CALL_STATUS.FAILURE;
      });
  };

  getSuccessfulMessage = () => {
    return (
      <Alert variant="success">
        <strong>Password changed.</strong>
      </Alert>
    );
  };

  getFailureMessage = () => {
    return <ErrorAlert error={this.error}></ErrorAlert>;
  };

  getResetForm = () => {
    return (
      <AvForm onValidSubmit={this.handleSavePassword}>
        <AvField
          name="password"
          label="password"
          placeholder={'Password'}
          type="password"
          validate={{
            required: {
              value: true,
              errorMessage: 'Your password is required.',
            },
            minLength: {
              value: 4,
              errorMessage:
                'Your password is required to be at least 4 characters.',
            },
            maxLength: {
              value: 50,
              errorMessage:
                'Your password cannot be longer than 50 characters.',
            },
          }}
          onChange={(event: any) => (this.currentPassword = event.target.value)}
        />
        <AvField
          name="newPassword"
          label="New password"
          placeholder={'New password'}
          type="password"
          validate={{
            required: {
              value: true,
              errorMessage: 'Your password is required.',
            },
            minLength: {
              value: 4,
              errorMessage:
                'Your password is required to be at least 4 characters.',
            },
            maxLength: {
              value: 50,
              errorMessage:
                'Your password cannot be longer than 50 characters.',
            },
          }}
          onChange={(event: any) => (this.newPassword = event.target.value)}
        />
        <PasswordStrengthBar password={this.newPassword} />
        <AvField
          name="confirmPassword"
          label="New password confirmation"
          placeholder="Confirm the new password"
          type="password"
          validate={{
            required: {
              value: true,
              errorMessage: 'Your confirmation password is required.',
            },
            minLength: {
              value: 4,
              errorMessage:
                'Your confirmation password is required to be at least 4 characters.',
            },
            maxLength: {
              value: 50,
              errorMessage:
                'Your confirmation password cannot be longer than 50 characters.',
            },
            match: {
              value: 'newPassword',
              errorMessage: 'The password and its confirmation do not match!',
            },
          }}
        />
        <Button color="success" type="submit">
          Save
        </Button>
      </AvForm>
    );
  };

  render() {
    return (
      <SmallPageContainer>
        {this.resetStatus === API_CALL_STATUS.SUCCESSFUL
          ? this.getSuccessfulMessage()
          : null}
        {this.resetStatus === API_CALL_STATUS.FAILURE
          ? this.getFailureMessage()
          : null}
        <h1>Change password</h1>
        <div>{this.getResetForm()}</div>
      </SmallPageContainer>
    );
  }
}
