import React from 'react';
import { RouterStore } from 'mobx-react-router';
import {
  PAGE_ROUTE,
  REDIRECT_TIMEOUT_MILLISECONDS,
  XREGEXP_VALID_LATIN_TEXT,
} from 'app/config/constants';
import { inject, observer } from 'mobx-react';
import { Button, ResponsiveEmbed, Row, Col, Tabs, Tab } from 'react-bootstrap';
import SmallPageContainer from '../SmallPageContainer';
import {
  AvForm,
  AvCheckboxGroup,
  AvCheckbox,
  AvInput,
} from 'availity-reactstrap-validation';
import XRegExp from 'xregexp';
import agreement from '../licenseAgreement/trialAccount/v1/license_agreement.pdf';
import { LicenseAgreement } from 'app/components/licenseAgreement/trialAccount/v1/LicenseAgreement';
import client from 'app/shared/api/clientInstance';
import * as QueryString from 'query-string';
import { notifyError, notifySuccess } from 'app/shared/utils/NotificationUtils';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { observable } from 'mobx';
import { Else, Then, If } from 'react-if';
import { UserDTO } from 'app/shared/api/generated/API';
import { Redirect } from 'react-router';

@inject('routing')
@observer
export default class ActivateTrialFinish extends React.Component<{
  routing: RouterStore;
}> {
  @observable loadingActivationInfo = true;
  @observable user: UserDTO;
  private activateKey: string;
  @observable infoMessage: string | JSX.Element;

  constructor(props: Readonly<{ routing: RouterStore }>) {
    super(props);
    const queryStrings = QueryString.parse(props.routing.location.search);
    if (queryStrings.key) {
      this.activateKey = queryStrings.key as string;
    }
  }

  handleValidSubmit = (event: any, values: any) => {
    client
      .finishTrialAccountActivationUsingPOST({
        keyAndTermsVm: {
          key: this.activateKey,
          readAndAgreeWithTheTerms: true,
        },
      })
      .then(
        () => {
          this.infoMessage =
            'You account has been activated. You will be redirected to login page.';
          setTimeout(() => {
            this.infoMessage = <Redirect to={PAGE_ROUTE.LOGIN} />;
          }, REDIRECT_TIMEOUT_MILLISECONDS);
        },
        (error: Error) => {
          notifyError(error);
        }
      );
  };

  componentDidMount() {
    client
      .getTrialAccountActivationInfoUsingGET({
        key: this.activateKey,
      })
      .then(
        user => {
          this.user = user;
        },
        (error: Error) => {
          this.infoMessage = 'No information found with the activation key.';
        }
      )
      .finally(() => {
        this.loadingActivationInfo = false;
      });
  }

  render() {
    return (
      <SmallPageContainer size={'lg'}>
        <If condition={this.loadingActivationInfo}>
          <Then>
            <LoadingIndicator isLoading />
          </Then>
          <Else>
            <If condition={this.infoMessage === undefined}>
              <Then>
                <AvForm onValidSubmit={this.handleValidSubmit}>
                  <Row>
                    <Col sm={12}>
                      <LicenseAgreement />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <AvCheckboxGroup
                        name={'acceptTheAgreement'}
                        required
                        key={'acceptTheAgreement'}
                        errorMessage={'You have to accept the term'}
                      >
                        <AvCheckbox
                          label={`I, ${this.user?.firstName} ${this.user?.lastName}, have read and agree with the terms and conditions above`}
                          value={true}
                        />
                      </AvCheckboxGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Button color="success" type="submit">
                        Confirm
                      </Button>
                    </Col>
                  </Row>
                </AvForm>
              </Then>
              <Else>{this.infoMessage}</Else>
            </If>
          </Else>
        </If>
      </SmallPageContainer>
    );
  }
}
