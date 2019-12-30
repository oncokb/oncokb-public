import React from 'react';
import { RouterStore } from 'mobx-react-router';
import * as QueryString from 'query-string';
import client from 'app/shared/api/clientInstance';
import { observable } from 'mobx';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { remoteData } from 'cbioportal-frontend-commons';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';
import { inject, observer } from 'mobx-react';
import { Col, Row, Alert } from 'react-bootstrap';
import SmallPageContainer from '../SmallPageContainer';
import MessageToContact from 'app/shared/texts/MessageToContact';

@inject('routing')
@observer
export default class ActivateAccount extends React.Component<{
  routing: RouterStore;
}> {
  @observable activateKey: string;

  constructor(props: Readonly<{ routing: RouterStore }>) {
    super(props);

    const queryStrings = QueryString.parse(props.routing.location.search);
    if (queryStrings.key) {
      this.activateKey = queryStrings.key as string;
    }
  }

  readonly activateAccount = remoteData<boolean>({
    invoke: () => {
      if (this.activateKey) {
        return client.activateAccountUsingGET({
          key: this.activateKey
        });
      } else {
        return Promise.reject('The key is empty');
      }
    }
  });

  getSuccessfulMessage = () => {
    return (
      <div>
        <Alert variant={'info'}>
          <p>
            Thank you for verifying your email address.{' '}
            {this.activateAccount.result && (
              <span>
                You can now <Link to={PAGE_ROUTE.LOGIN}>login</Link> to your
                OncoKB account.
              </span>
            )}
          </p>

          {!this.activateAccount.result && (
            <p>
              We are reviewing your registration information and will contact
              you about your account&apos;s approval status within two business
              days.
            </p>
          )}
          <MessageToContact
            className={'mb-3'}
            emailTitle={'Account Activation Question'}
          />
          <p>
            <div>Sincerely,</div>
            <div>The OncoKB Team</div>
          </p>
        </Alert>
      </div>
    );
  };

  getFailureMessage = () => {
    // the server attaches more information into the error which the type does not allow
    const error = this.activateAccount.error as any;
    const defaultInfo = 'Your user account could not be activated.';
    return (
      <div>
        <Alert variant={'warning'}>
          {this.activateAccount.error
            ? error.response &&
              error.response.body &&
              error.response.body.detail
              ? error.response.body.detail
              : `${defaultInfo} due to ${error.message}`
            : defaultInfo}
        </Alert>
      </div>
    );
  };

  render() {
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
