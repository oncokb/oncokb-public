import React from 'react';
import { RouterStore } from 'mobx-react-router';
import { XREGEXP_VALID_LATIN_TEXT } from 'app/config/constants';
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

@inject('routing')
@observer
export default class ActivateTrialFinish extends React.Component<{
  routing: RouterStore;
}> {
  private activateKey: string;

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
        keyAndContactVm: {
          key: this.activateKey,
          contact: {
            name: values.pointOfContactName,
            email: values.pointOfContactEmail,
          },
        },
      })
      .then(
        () => {
          notifySuccess('You account has been activated. You can now login.');
        },
        (error: Error) => {
          notifyError(error);
        }
      );
  };

  render() {
    return (
      <SmallPageContainer size={'lg'}>
        <AvForm onValidSubmit={this.handleValidSubmit}>
          <Row>
            <Col sm={12}>
              <Tabs defaultActiveKey={'html'}>
                <Tab eventKey="iframe" title="Embed" style={{ paddingTop: 10 }}>
                  <ResponsiveEmbed>
                    <embed src={agreement} />
                  </ResponsiveEmbed>
                </Tab>
                <Tab eventKey="html" title="HTML" style={{ paddingTop: 10 }}>
                  <LicenseAgreement />
                </Tab>
              </Tabs>
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
                  label={
                    'I have read and agree with the terms and conditions above'
                  }
                  value={true}
                />
              </AvCheckboxGroup>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <Col sm={12} md={3}>
              <h6>Point of Contact</h6>
            </Col>
            <Col sm={12} md={3}>
              <AvInput
                name="pointOfContactName"
                placeholder={'Name'}
                validate={{
                  required: {
                    value: true,
                    errorMessage: 'The name is required.',
                  },
                  pattern: {
                    value: XRegExp(XREGEXP_VALID_LATIN_TEXT),
                    errorMessage:
                      'Sorry, we only support Latin letters for now.',
                  },
                  minLength: {
                    value: 1,
                    errorMessage: 'The name can not be empty',
                  },
                }}
              />
            </Col>
            <Col sm={12} md={3}>
              <AvInput
                name="pointOfContactEmail"
                placeholder={'Email'}
                type="email"
                validate={{
                  required: {
                    value: true,
                    errorMessage: 'The email is required.',
                  },
                  minLength: {
                    value: 5,
                    errorMessage:
                      'The email is required to be at least 5 characters.',
                  },
                  maxLength: {
                    value: 254,
                    errorMessage:
                      'The email cannot be longer than 50 characters.',
                  },
                }}
              />
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
      </SmallPageContainer>
    );
  }
}
