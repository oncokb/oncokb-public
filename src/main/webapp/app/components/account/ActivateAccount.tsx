import React from 'react';
import { RouterStore } from 'mobx-react-router';
import * as QueryString from 'query-string';
import client from 'app/shared/api/clientInstance';
import { observable, action } from 'mobx';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { remoteData } from 'cbioportal-frontend-commons';
import { Link } from 'react-router-dom';
import { ONCOKB_TM, PAGE_ROUTE } from 'app/config/constants';
import { inject, observer } from 'mobx-react';
import { Alert, Form, Button } from 'react-bootstrap';
import SmallPageContainer from '../SmallPageContainer';
import MessageToContact from 'app/shared/texts/MessageToContact';
import { ContactLink } from 'app/shared/links/ContactLink';
import * as styles from '../../index.module.scss';

@inject('routing')
@observer
export default class ActivateAccount extends React.Component<{
  routing: RouterStore;
}> {
  @observable activateKey: string;
  @observable manualKey = '';

  constructor(props: Readonly<{ routing: RouterStore }>) {
    super(props);

    const queryStrings = QueryString.parse(props.routing.location.search);
    if (queryStrings.key) {
      this.activateKey = queryStrings.key as string;
    }
  }

  readonly activateAccount = remoteData({
    invoke: () => {
      if (this.activateKey) {
        return client.activateAccountUsingGET({
          key: this.activateKey,
        });
      } else {
        return Promise.reject('The activation key is empty');
      }
    },
  });

  @action.bound
  submitManualKey() {
    const trimmed = this.manualKey.trim();
    if (trimmed) {
      this.activateKey = trimmed;
    }
  }

  getManualKeyForm = () => {
    return (
      <div>
        <Alert variant={'info'} className={styles.biggerText}>
          <p>
            Please paste your activation key below to verify your email address.
            You can find the key in the verification email you received.
          </p>
          <Form.Group className={'mb-3'}>
            <Form.Label>Activation Key</Form.Label>
            <Form.Control
              type="text"
              value={this.manualKey}
              onChange={action((e: React.ChangeEvent<HTMLInputElement>) => {
                this.manualKey = e.target.value;
              })}
              placeholder="Paste your activation key here"
            />
          </Form.Group>
          <Button
            block
            variant="outline-primary"
            className="font-medium"
            disabled={!this.manualKey.trim()}
            onClick={this.submitManualKey}
          >
            Verify Email Address
          </Button>
        </Alert>
      </div>
    );
  };

  getSuccessfulMessage = () => {
    return (
      <div>
        <Alert variant={'info'} className={styles.biggerText}>
          <p>
            Thank you for verifying your email address.{' '}
            {this.activateAccount.result?.activated && (
              <span>
                You can now <Link to={PAGE_ROUTE.LOGIN}>login</Link> to your{' '}
                {ONCOKB_TM} account.
              </span>
            )}
          </p>

          {!this.activateAccount.result?.activated && (
            <p>
              {this.activateAccount.result?.hasGracePeriod ? (
                <>
                  <span>
                    You have access while your request is under review.
                  </span>
                  <span>
                    {' '}
                    You may now <Link to={PAGE_ROUTE.LOGIN}>log in</Link> to
                    your {ONCOKB_TM} account.
                  </span>
                </>
              ) : (
                <span>
                  You do not have a grace period. Access will be enabled after
                  approval.
                </span>
              )}
            </p>
          )}
          <MessageToContact
            className={'mb-3'}
            emailTitle={'Account Activation Question'}
          />
          <p>
            <div>Sincerely,</div>
            <div>The {ONCOKB_TM} Team</div>
          </p>
        </Alert>
      </div>
    );
  };

  getFailureMessage = () => {
    // the server attaches more information into the error which the type does not allow
    const error = this.activateAccount.error as any;
    const serverDetail: string | undefined =
      error?.response?.body?.detail ?? error?.response?.body?.title;

    // When the activation key can't be found, we can't tell whether it was
    // already used (e.g. the user clicked the verification link twice) or was
    // never valid. Rather than showing an alarming "invalid or already used"
    // message, guide the user to the action that fits their situation. The
    // server flags this case with a dedicated errorKey.
    const activationKeyNotUsable: boolean =
      error?.response?.body?.errorKey === 'activationkeynotfound';

    if (activationKeyNotUsable) {
      return (
        <div>
          <Alert variant={'warning'}>
            <Alert.Heading>Activation key already used</Alert.Heading>
            <p>
              Please try signing in. This activation key can only be used once
              and may have already been used.
            </p>
            <Link
              className="btn btn-primary btn-block font-medium"
              to={PAGE_ROUTE.LOGIN}
            >
              Sign in to {ONCOKB_TM}
            </Link>
            <div className={'mt-3'}>
              Need help?{' '}
              <ContactLink emailSubject={'Account Activation Question'}>
                Contact support
              </ContactLink>
            </div>
          </Alert>
        </div>
      );
    }

    const defaultInfo = 'Your user account could not be activated.';
    return (
      <div>
        <Alert variant={'warning'} className={styles.biggerText}>
          {this.activateAccount.error
            ? serverDetail
              ? serverDetail
              : `${defaultInfo} due to ${error.message}`
            : defaultInfo}
        </Alert>
      </div>
    );
  };

  render() {
    if (!this.activateKey) {
      return <SmallPageContainer>{this.getManualKeyForm()}</SmallPageContainer>;
    }

    return (
      <SmallPageContainer>
        {this.activateAccount.isPending ? (
          <LoadingIndicator isLoading={true} />
        ) : null}
        {this.activateAccount.isComplete ? this.getSuccessfulMessage() : null}
        {this.activateAccount.isError ? this.getFailureMessage() : null}
      </SmallPageContainer>
    );
  }
}
