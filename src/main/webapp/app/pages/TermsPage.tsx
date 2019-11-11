import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import './TermsPage.scss';
import { Link } from 'react-router-dom';
import { ONCOKB_CONTACT_EMAIL, PAGE_ROUTE } from 'app/config/constants';

export const TermsPage = () => {
  return (
    <div className="terms">
      <Row>
        <Col>
          <h2>Usage Terms</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <div>
            OncoKB is a precision oncology knowledge base maintained by Memorial
            Sloan Kettering Cancer Center (MSK). MSK reserves the right to
            update https://www.oncokb.org at any time without notice. MSK makes
            no warranties or representations, express or implied, with respect
            to any of the content, including as to the present accuracy,
            completeness, timeliness, adequacy, or usefulness of any of the
            content, and by using this website you agree that MSK will not be
            liable for any loss or damages arising from your use of or reliance
            on information contained in this site or other sites that may be
            linked to from our site. This information is not intended as a
            substitute for medical professional help or advice. A physician
            should always be consulted for any health problem or medical
            condition. Inquiries about the content should be directed to{' '}
            <a href={`mailto:${ONCOKB_CONTACT_EMAIL}`} target="_top">
              {ONCOKB_CONTACT_EMAIL}
            </a>
            .
          </div>

          <div>
            You may view the content contained on https://www.oncokb.org solely
            for your own personal or research purposes. You may not use any part
            of the <Link to={PAGE_ROUTE.HOME}>https://www.oncokb.org</Link>{' '}
            content (“Content”) for any commercial purpose, including the
            distribution, licensing or sale of the Content to any other person
            or entity, whether alone or in combination with other materials, or
            the incorporation of the Content into any commercial product. You
            may copy, reproduce, or create derivative works of the Content only
            if:
            <ul>
              <li>
                you are a researcher or a non-profit entity;{' '}
                <span className="highlight">and</span>
              </li>
              <li>
                your use of the Content complies with all of the following
                requirements:
                <ul>
                  <li>
                    you are using the Content for personal or research purposes
                    only; <span className="highlight">and</span>
                  </li>
                  <li>
                    you are using the Content only to replicate OncoKB locally,
                    whether in whole or in part;
                    <span className="highlight">or</span>
                  </li>
                  <li>
                    you are aggregating the Content with other data of similar
                    nature for the purposes of advancing cancer research. You
                    must credit the source and reference these usage terms.
                  </li>
                </ul>
              </li>
              <li>
                you seek to use OncoKB for clinical or commercial purposes,
                please visit the{' '}
                <Link to={PAGE_ROUTE.REGISTER}>registration page</Link> and
                select your anticipated use
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  );
};
