import React from 'react';
import { RouterStore } from 'mobx-react-router';
import { PAGE_ROUTE } from 'app/config/constants';
import { inject, observer } from 'mobx-react';
import { Button, Col, Row } from 'react-bootstrap';
import SmallPageContainer from 'app/components/SmallPageContainer';
import {
  AvCheckbox,
  AvCheckboxGroup,
  AvForm,
} from 'availity-reactstrap-validation';
import * as QueryString from 'query-string';
import { notifyError } from 'app/shared/utils/NotificationUtils';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { observable } from 'mobx';
import { Else, If, Then } from 'react-if';
import { Redirect } from 'react-router';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import agreementPdf from 'app/components/licenseAgreement/benchmarking/v1/benchmarking_agreement.pdf';
import { BenchmarkingAgreement } from 'app/components/licenseAgreement/benchmarking/v1/BenchmarkingAgreement';
import * as request from 'superagent';

@inject('routing')
@observer
export default class BenchmarkingAgreementPage extends React.Component<{
  routing: RouterStore;
}> {
  @observable loading = true;
  @observable agreementInfo:
    | {
        firstName: string;
        lastName: string;
        agreementName: string;
        agreementVersion: string;
      }
    | undefined;
  @observable infoMessage: string | JSX.Element | undefined;
  private agreementKey = '';

  constructor(props: Readonly<{ routing: RouterStore }>) {
    super(props);
    const queryStrings = QueryString.parse(props.routing.location.search);
    if (queryStrings.key) {
      this.agreementKey = queryStrings.key as string;
    }
  }

  componentDidMount() {
    if (!this.agreementKey) {
      this.infoMessage = 'This agreement link is invalid.';
      this.loading = false;
      return;
    }

    request
      .get('/api/account/benchmarking-agreement/info')
      .query({ key: this.agreementKey })
      .then(result => {
        this.agreementInfo = result.body;
      })
      .catch((error: Error) => {
        notifyError(error);
        this.infoMessage =
          'This agreement link is invalid or has already been used.';
      })
      .finally(() => {
        this.loading = false;
      });
  }

  handleValidSubmit = () => {
    request
      .post('/api/account/benchmarking-agreement/finish')
      .send({
        key: this.agreementKey,
        readAndAgreeWithTheTerms: true,
      })
      .then(() => {
        this.infoMessage =
          'Thank you. Your benchmarking agreement has been signed. You will be redirected to login.';
        setTimeout(() => {
          this.infoMessage = <Redirect to={PAGE_ROUTE.LOGIN} />;
        }, 3000);
      })
      .catch((error: Error) => {
        notifyError(error);
      });
  };

  render() {
    return (
      <If condition={this.loading}>
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
                      className="float-right btn-sm"
                      href={agreementPdf}
                    >
                      Download PDF
                    </DownloadButton>
                  </Col>
                </Row>

                <SmallPageContainer size={'lg'}>
                  <AvForm onValidSubmit={this.handleValidSubmit}>
                    <Row>
                      <Col sm={12}>
                        <BenchmarkingAgreement />
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <AvCheckboxGroup
                          name={'acceptBenchmarkingAgreement'}
                          required
                          errorMessage={
                            'You have to accept the terms to sign the benchmarking agreement.'
                          }
                        >
                          <AvCheckbox
                            label={`I, ${this.agreementInfo?.firstName || ''} ${
                              this.agreementInfo?.lastName || ''
                            }, have read and agree with the terms and conditions above.`}
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
