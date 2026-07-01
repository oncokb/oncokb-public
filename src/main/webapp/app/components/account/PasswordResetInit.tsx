import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SmallPageContainer from '../SmallPageContainer';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { action, computed, observable } from 'mobx';
import client from 'app/shared/api/clientInstance';
import { observer } from 'mobx-react';
import { API_CALL_STATUS, PAGE_ROUTE } from 'app/config/constants';
import autobind from 'autobind-decorator';
import ReCAPTCHA from 'app/shared/recaptcha/recaptcha';
import { setRecaptchaToken } from 'app/indexUtils';

@observer
export class PasswordResetInit extends React.Component<{}> {
  @observable resetStatus: API_CALL_STATUS;
  @observable email = '';
  recaptcha = new ReCAPTCHA();

  @computed
  get hasEnteredEmail() {
    return this.email.trim().length > 0;
  }

  @action
  handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.email = event.target.value;
  };

  @autobind
  @action
  async resetPassword(event: any, values: any) {
    const token: string = await this.recaptcha.getToken();
    setRecaptchaToken(token);
    if (values.email) {
      client
        .requestPasswordResetUsingPOST({
          mail: values.email,
        })
        .then(() => {
          this.resetStatus = API_CALL_STATUS.SUCCESSFUL;
        })
        .catch(() => {
          this.resetStatus = API_CALL_STATUS.FAILURE;
        });
    } else {
      this.resetStatus = API_CALL_STATUS.FAILURE;
    }
  }

  render() {
    return (
      <SmallPageContainer>
        <h1 className="h2">Forgot password?</h1>
        <p>No worries, we'll send you reset instructions</p>
        <Alert variant={'warning'}>
          <span>Enter the email address you used to register</span>
        </Alert>
        {this.resetStatus === API_CALL_STATUS.SUCCESSFUL ? (
          <Alert variant="success">
            Check your email for details on how to reset your password.
          </Alert>
        ) : null}
        {this.resetStatus === API_CALL_STATUS.FAILURE ? (
          <Alert variant="danger">
            <strong>Email address isn&apos;t registered!</strong> Please check
            and try again
          </Alert>
        ) : null}
        <AvForm onValidSubmit={this.resetPassword}>
          <AvField
            name="email"
            label="Email"
            placeholder={'Your email'}
            type="email"
            value={this.email}
            onChange={this.handleEmailChange}
            validate={{
              required: {
                value: true,
                errorMessage: 'Your email is required.',
              },
              minLength: {
                value: 5,
                errorMessage:
                  'Your email is required to be at least 5 characters.',
              },
              maxLength: {
                value: 254,
                errorMessage:
                  'Your email cannot be longer than 254 characters.',
              },
            }}
          />
          <Button
            block
            variant="outline-primary"
            className="font-medium"
            type="submit"
            disabled={!this.hasEnteredEmail}
          >
            Reset password
          </Button>
          <div className="text-center mt-3">
            <Link to={PAGE_ROUTE.LOGIN}>
              <i className="fa fa-arrow-left mr-2" aria-hidden="true" />
              Back to login
            </Link>
          </div>
        </AvForm>
      </SmallPageContainer>
    );
  }
}
