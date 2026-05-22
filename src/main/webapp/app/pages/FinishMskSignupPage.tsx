import React from 'react';
import { Redirect } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import * as request from 'superagent';
import { Button, Col, Row } from 'react-bootstrap';
import AuthenticationStore from 'app/store/AuthenticationStore';
import WindowStore from 'app/store/WindowStore';
import SmallPageContainer from 'app/components/SmallPageContainer';
import ApiAccessSection from 'app/components/newAccountForm/ApiAccessSection';
import { FormKey } from 'app/components/newAccountForm/NewAccountForm';
import { LicenseType, PAGE_ROUTE } from 'app/config/constants';
import {
  SHORT_TEXT_VAL,
  TEXT_VAL,
} from 'app/shared/utils/FormValidationUtils';
import { getClientInstanceURL } from 'app/shared/utils/DevUtils';
import { OncoKBError } from 'app/shared/alert/ErrorAlertUtils';
import { ErrorAlert } from 'app/shared/alert/ErrorAlert';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';

type FinishMskSignupProps = {
  authenticationStore: AuthenticationStore;
  windowStore: WindowStore;
};

@inject('authenticationStore', 'windowStore')
@observer
export default class FinishMskSignupPage extends React.Component<
  FinishMskSignupProps
> {
  @observable email = '';
  @observable firstName = '';
  @observable lastName = '';
  @observable loading = true;
  @observable submitting = false;
  @observable apiAccessRequested = false;
  @observable error: OncoKBError | undefined;
  @observable completed = false;
  @observable signupUserLoaded = false;

  componentDidMount() {
    request
      .get(getClientInstanceURL('oauth2/signup-user'))
      .then(response => {
        this.email = response.body.email;
        this.firstName = response.body.firstName || '';
        this.lastName = response.body.lastName || '';
        this.signupUserLoaded = true;
      })
      .catch(error => {
        this.error = error;
      })
      .finally(
        action(() => {
          this.loading = false;
        })
      );
  }

  @action
  handleValidSubmit = (event: any, values: any) => {
    this.submitting = true;
    this.error = undefined;
    request
      .post(getClientInstanceURL('oauth2/complete-signup'))
      .send({
        firstName: values.firstName,
        lastName: values.lastName,
        jobTitle: values.jobTitle,
        apiAccessRequested: this.apiAccessRequested,
        apiAccessJustification: values[FormKey.API_ACCESS_JUSTIFICATION],
      })
      .then(response => {
        this.props.authenticationStore.loginSuccessCallback(response.body);
        this.completed = true;
      })
      .catch(error => {
        this.error = error;
      })
      .finally(
        action(() => {
          this.submitting = false;
        })
      );
  };

  render() {
    if (this.completed) {
      return <Redirect to={PAGE_ROUTE.ACCOUNT_SETTINGS} />;
    }

    return (
      <SmallPageContainer size="md">
        {this.error ? <ErrorAlert error={this.error} /> : null}
        {this.loading ? (
          <LoadingIndicator isLoading />
        ) : this.signupUserLoaded ? (
          <AvForm onValidSubmit={this.handleValidSubmit}>
            <h2>Finish account setup</h2>
            <p>
              Almost there! Complete just a few more details to finish setting
              up your new OncoKB account.
            </p>
            <Row>
              <Col>
                <AvField
                  name="email"
                  label="MSK Email"
                  type="email"
                  value={this.email}
                  disabled
                />
                <AvField
                  name="firstName"
                  autoComplete="given-name"
                  label="First Name"
                  defaultValue={this.firstName}
                  validate={{
                    required: {
                      value: true,
                      errorMessage: 'Your first name is required.',
                    },
                    ...SHORT_TEXT_VAL,
                  }}
                />
                <AvField
                  name="lastName"
                  autoComplete="family-name"
                  label="Last Name"
                  defaultValue={this.lastName}
                  validate={{
                    required: {
                      value: true,
                      errorMessage: 'Your last name is required.',
                    },
                    ...SHORT_TEXT_VAL,
                  }}
                />
                <AvField
                  name="jobTitle"
                  label="Job Title/Position"
                  validate={{
                    required: {
                      value: true,
                      errorMessage: 'Your job title/position is required.',
                    },
                    ...TEXT_VAL,
                  }}
                />
              </Col>
            </Row>
            <ApiAccessSection
              apiAccessRequested={this.apiAccessRequested}
              apiAccessJustificationFieldName={FormKey.API_ACCESS_JUSTIFICATION}
              inline
              licenseType={LicenseType.ACADEMIC}
              requestApiAccessFieldName={FormKey.REQUEST_API_ACCESS}
              onToggleApiAccess={() =>
                (this.apiAccessRequested = !this.apiAccessRequested)
              }
            />
            <Row className="mt-2">
              <Col>
                <Button
                  id="finish-signup-submit"
                  variant="primary"
                  type="submit"
                  disabled={this.submitting || !this.signupUserLoaded}
                >
                  {this.submitting ? 'Completing Signup' : 'Complete Signup'}
                </Button>
              </Col>
            </Row>
          </AvForm>
        ) : null}
      </SmallPageContainer>
    );
  }
}
