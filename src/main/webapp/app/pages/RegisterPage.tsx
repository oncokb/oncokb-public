import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  action,
  computed,
  observable,
  reaction,
  IReactionDisposer
} from 'mobx';
import autobind from 'autobind-decorator';
import { Redirect } from 'react-router-dom';
import client from 'app/shared/api/clientInstance';
import { ManagedUserVM } from 'app/shared/api/generated/API';
import {
  LicenseType,
  QUERY_SEPARATOR_FOR_QUERY_STRING
} from 'app/config/constants';
import { Alert, Row, Col, Button } from 'react-bootstrap';
import { RouterStore } from 'mobx-react-router';
import * as QueryString from 'query-string';
import WindowStore from 'app/store/WindowStore';
import SmallPageContainer from 'app/components/SmallPageContainer';
import MessageToContact from 'app/shared/texts/MessageToContact';
import { ErrorAlert, OncoKBError } from 'app/shared/alert/ErrorAlert';
import { NewAccountForm } from 'app/components/newAccountForm/NewAccountForm';

export type NewUserRequiredFields = {
  username: string;
  password: string;
  email: string;
  jobTitle?: string;
};

enum RegisterStatus {
  REGISTERED,
  NOT_SUCCESS,
  NA,
  READY_REDIRECT
}

export type IRegisterProps = {
  routing: RouterStore;
  windowStore: WindowStore;
  handleRegister: (newUser: NewUserRequiredFields) => void;
};

export const LICENSE_HASH_KEY = 'license';

@inject('routing', 'windowStore')
@observer
export class RegisterPage extends React.Component<IRegisterProps> {
  @observable registerStatus: RegisterStatus = RegisterStatus.NA;
  @observable registerError: OncoKBError;
  @observable selectedLicense: LicenseType | undefined;

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: Readonly<IRegisterProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING
          });
          if (queryStrings[LICENSE_HASH_KEY]) {
            this.selectedLicense = queryStrings[
              LICENSE_HASH_KEY
            ] as LicenseType;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.selectedLicense,
        newSelection => {
          const parsedHashQueryString = QueryString.stringify(
            {
              [LICENSE_HASH_KEY]: newSelection
            },
            { arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING }
          );
          window.location.hash = parsedHashQueryString;
        }
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  @autobind
  @action
  handleValidSubmit(newAccount: Partial<ManagedUserVM>) {
    client
      .registerAccountUsingPOST({
        managedUserVm: newAccount as ManagedUserVM
      })
      .then(this.successToRegistered, this.failedToRegistered);
  }

  @action.bound
  redirectToAccountPage() {
    this.registerStatus = RegisterStatus.READY_REDIRECT;
  }

  @action.bound
  successToRegistered() {
    this.registerStatus = RegisterStatus.REGISTERED;
    // setTimeout(this.redirectToAccountPage, REDIRECT_TIMEOUT_MILLISECONDS);
  }

  @action.bound
  failedToRegistered(error: OncoKBError) {
    this.registerStatus = RegisterStatus.NOT_SUCCESS;
    this.registerError = error;
    window.scrollTo(0, 0);
  }

  getErrorMessage(additionalInfo = '') {
    return (
      (additionalInfo ? `${additionalInfo}, w` : 'W') +
      'e were not able to create an account for you.'
    );
  }

  @computed
  get errorRegisterMessage() {
    if (
      this.registerError &&
      this.registerError.response &&
      this.registerError.response.body &&
      this.registerError.response.body.title
    ) {
      return this.getErrorMessage(this.registerError.response.body.title);
    } else {
      return this.getErrorMessage();
    }
  }

  @autobind
  @action
  onSelectLicense(license: LicenseType | undefined) {
    this.selectedLicense = license;
  }

  render() {
    if (this.registerStatus === RegisterStatus.READY_REDIRECT) {
      return <Redirect to={'/'} />;
    }

    if (this.registerStatus === RegisterStatus.REGISTERED) {
      return (
        <SmallPageContainer className={'registerPage'}>
          <div>
            <Alert variant="info">
              <p className={'mb-3'}>
                Thank you for creating an OncoKB account. We have sent you an
                email to verify your email address. Please follow the
                instructions in the email to complete registration.
              </p>
              <MessageToContact emailTitle={'Registration Question'} />
              <p>
                <div>Sincerely,</div>
                <div>The OncoKB Team</div>
              </p>
            </Alert>
          </div>
        </SmallPageContainer>
      );
    }

    return (
      <div className={'registerPage'}>
        {this.registerError ? <ErrorAlert error={this.registerError} /> : null}
        <NewAccountForm
          isLargeScreen={this.props.windowStore.isLargeScreen}
          defaultLicense={this.selectedLicense}
          onSubmit={this.handleValidSubmit}
          byAdmin={false}
          onSelectLicense={this.onSelectLicense}
        />
      </div>
    );
  }
}
