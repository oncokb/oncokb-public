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
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import agreementPdf from 'app/components/licenseAgreement/trialAccount/v1/license_agreement.pdf';

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
            'Your trial account has been activated. You will be redirected to login page.';
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
          this.infoMessage =
            'This activation key is invalid. The key is either incorrect, or the license has already been activated.';
        }
      )
      .finally(() => {
        this.loadingActivationInfo = false;
      });
  }

  render() {
    return (
      <If condition={this.loadingActivationInfo}>
        <Then>
          <LoadingIndicator isLoading />
        </Then>
        <Else>
          <If condition={this.infoMessage === undefined}>
            <Then>
              <>
                <Row>
                  <Col>
                    <DownloadButton
                      className="float-right"
                      size={'sm'}
                      href={agreementPdf}
                    >
                      <i className={'fa fa-cloud-download mr-1'} />
                      Download PDF
                    </DownloadButton>
                  </Col>
                </Row>

                <SmallPageContainer size={'lg'}>
                  <AvForm onValidSubmit={this.handleValidSubmit}>
                    <Row>
                      <Col sm={12}>
                        <LicenseAgreement />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <AvCheckboxGroup
                          name={'acceptTheAgreement'}
                          required
                          key={'acceptTheAgreement'}
                          errorMessage={
                            'You have to accept the terms to activate your license.'
                          }
                        >
                          <AvCheckbox
                            label={`I, ${this.user?.firstName} ${this.user?.lastName}, have read and agree with the terms and conditions above.`}
                            value={true}
                          />
                        </AvCheckboxGroup>
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <Button color="success" type="submit">
                          Confirm
                        </Button>
                      </Col>
                    </Row>
                  </AvForm>
                </SmallPageContainer>
              </>
            </Then>
            <Else>
              <SmallPageContainer>{this.infoMessage}</SmallPageContainer>
            </Else>
          </If>
        </Else>
      </If>
    );
  }
}
