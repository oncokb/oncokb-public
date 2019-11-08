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

  readonly activateAccount = remoteData<any>({
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
          <p>Thank you for confirming your email.</p>
          <p>
            We are reviewing your registration information and will contact you
            about your account&apos;s approval status within two business days.
          </p>
          <MessageToContact
            className={'mb-3'}
            emailTitle={'Account Activation Question'}
          />
          <p>Regards,</p>
          <p>The OncoKB Team</p>
        </Alert>
      </div>
    );
  };

  getFailureMessage = () => {
    return (
      <div>
        <Alert variant={'warning'}>
          Your user account could not be activated
          {this.activateAccount.error
            ? ` due to ${this.activateAccount.error.message}`
            : ''}
          .
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
