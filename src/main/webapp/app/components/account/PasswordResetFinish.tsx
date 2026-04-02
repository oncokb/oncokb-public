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
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';

@inject('routing')
@observer
export default class PasswordResetFinish extends React.Component<{
  routing: RouterStore;
}> {
  @observable activateKey: string;
  @observable password = '';
  @observable resetStatus: API_CALL_STATUS;
  @observable error: Error;
  @observable isCheckingResetKey = false;
  @observable isResetKeyValid = false;

  constructor(props: Readonly<{ routing: RouterStore }>) {
    super(props);

    const queryStrings = QueryString.parse(props.routing.location.search);
    if (queryStrings.key) {
      this.activateKey = queryStrings.key as string;
    }
  }

  componentDidMount() {
    if (!this.activateKey) {
      return;
    }

    this.isCheckingResetKey = true;
    client
      .getPasswordResetInfoUsingGET({
        key: this.activateKey,
      })
      .then(() => {
        this.isResetKeyValid = true;
        this.isCheckingResetKey = false;
      })
      .catch(error => {
        this.error = error;
        this.isCheckingResetKey = false;
        this.resetStatus = API_CALL_STATUS.FAILURE;
      });
  }

  handleValidSubmit = (event: any, values: any) => {
    client
      .finishPasswordResetUsingPOST({
        keyAndPassword: {
          key: this.activateKey,
          newPassword: values.newPassword,
        },
      })
      .then(() => {
        this.resetStatus = API_CALL_STATUS.SUCCESSFUL;
      })
      .catch(error => {
        this.error = error;
        this.resetStatus = API_CALL_STATUS.FAILURE;
      });
  };

  getSuccessfulMessage = () => {
    return (
      <Alert variant="success">
        <strong>Your password has been reset.</strong> Please{' '}
        <Link to={PAGE_ROUTE.LOGIN}>log in</Link>.
      </Alert>
    );
  };

  getFailureMessage = () => {
    return (
      <>
        <Alert variant="danger">
          <div>
            This password reset link has already been used or is invalid.
          </div>
        </Alert>
        <Link
          className="btn btn-primary"
          to={PAGE_ROUTE.ACCOUNT_PASSWORD_RESET_REQUEST}
        >
          Request a new reset link
        </Link>
      </>
    );
  };

  getResetForm = () => {
    return (
      <AvForm onValidSubmit={this.handleValidSubmit}>
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
          onChange={(event: any) => (this.password = event.target.value)}
        />
        <PasswordStrengthBar password={this.password} />
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
          Validate new password
        </Button>
      </AvForm>
    );
  };

  renderContent = () => {
    if (this.isCheckingResetKey) {
      return <LoadingIndicator isLoading />;
    }

    if (this.resetStatus === API_CALL_STATUS.SUCCESSFUL) {
      return this.getSuccessfulMessage();
    }

    if (!this.activateKey || this.resetStatus === API_CALL_STATUS.FAILURE) {
      return this.getFailureMessage();
    }

    if (this.isResetKeyValid) {
      return (
        <>
          <h1>Reset password</h1>
          {this.getResetForm()}
        </>
      );
    }

    return null;
  };

  render() {
    return <SmallPageContainer>{this.renderContent()}</SmallPageContainer>;
  }
}
