import * as React from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import './TermsPage.scss';
import { Link } from 'react-router-dom';
import {
  DOCUMENT_TITLES,
  IMG_MAX_WIDTH,
  ONCOKB_CONTACT_EMAIL,
  PAGE_ROUTE,
  PAGE_TITLE,
} from 'app/config/constants';
import { OncoKBLink } from 'app/shared/links/OncoKBLink';
import { ContactLink } from 'app/shared/links/ContactLink';

enum TabKey {
  ACADEMIC = 'ACADEMIC',
  COMMERCIAL = 'COMMERCIAL',
}
export const TermsPage = () => {
  return (
    <div className="terms">
      <Row>
        <Col>
          <Tabs
            defaultActiveKey={TabKey.ACADEMIC}
            className={'mt-2'}
            id="terms-tabs"
          >
            <Tab eventKey={TabKey.ACADEMIC} title={'Academic Research'}>
              <div className={'mt-2'}>
                <p>
                  OncoKB is a precision oncology knowledge base maintained by
                  Memorial Sloan Kettering Cancer Center (MSK). MSK may, from
                  time to time, update the content on <OncoKBLink />{' '}
                  (“Content”). MSK makes no warranties or representations,
                  express or implied, with respect to any of the Content,
                  including as to the present accuracy, completeness,
                  timeliness, adequacy, or usefulness of any of the Content. By
                  using this website, you agree that MSK will not be liable for
                  any losses or damages arising from your use of or reliance on
                  the Content, or other websites or information to which this
                  website may be linked. The Content is not intended as a
                  substitute for professional medical help, judgment or advice.
                  A physician or other qualified health provider should always
                  be consulted for any health problem or medical condition.
                  Inquiries about the Content should be directed to{' '}
                  <a href={`mailto:${ONCOKB_CONTACT_EMAIL}`} target="_top">
                    {ONCOKB_CONTACT_EMAIL}
                  </a>
                  .
                </p>
                <p>
                  You may view the Content solely for your own personal
                  reference or use for research in an academic setting, provided
                  that all academic research use of the Content must credit
                  OncoKB as the source of the Content and reference these Terms
                  of Use; outside of scientific publication, you may not
                  otherwise redistribute or share the Content with any third
                  party, in part or in whole, for any purpose, without the
                  express permission of MSK.
                </p>
                <div>
                  Unless you have signed a license agreement with MSK, you may
                  not use any part of the Content for any other purpose,
                  including:
                </div>
                <ol>
                  <li>
                    use or incorporation into a commercial product or towards
                    performance of a commercial service;
                  </li>
                  <li>research use in a commercial setting;</li>
                  <li>use for patient services; or</li>
                  <li>
                    generation of reports in a hospital or other patient care
                    setting.
                  </li>
                </ol>
                <p>
                  You may not copy, transfer, reproduce, modify or create
                  derivative works of OncoKB for any commercial purpose without
                  the express permission of MSK. If you seek to use OncoKB for
                  such purposes, please visit the{' '}
                  <Link to={PAGE_ROUTE.REGISTER}>registration page</Link> and
                  request the license which best describes your anticipated use
                  of OncoKB.
                </p>
              </div>
            </Tab>
            <Tab eventKey={TabKey.COMMERCIAL} title={'Commercial'}>
              <p className={'m-2'}>
                Please use the button above to request the license which best
                describes your anticipated use of OncoKB. You can also send us
                an email with your use case at{' '}
                <ContactLink
                  emailSubject={'Request for OncoKB Commercial License'}
                />
                . We will help you to find the most suitable license.
              </p>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};
