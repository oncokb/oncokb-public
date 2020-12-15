import * as React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import MskccLogo from './MskccLogo';

import styles from './Footer.module.scss';
import indexStyles from '../index.module.scss';
import { CitationText } from 'app/components/CitationText';
import classnames from 'classnames';
import { ContactLink } from 'app/shared/links/ContactLink';
import { API_DOCUMENT_LINK, PAGE_ROUTE } from 'app/config/constants';
import { Linkout } from 'app/shared/links/Linkout';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import { OncoTreeLink } from 'app/shared/utils/UrlUtils';

class Footer extends React.Component<{ lastDataUpdate: string }> {
  public get externalLinks() {
    return (
      <>
        <div className={'mb-2'}>
          Please review the{' '}
          <Link to={'/terms'} className={indexStyles.orange}>
            terms of use
          </Link>{' '}
          before continuing.
        </div>
        <div className={'mb-2'}>
          <CitationText highlightLinkout={true} />
        </div>
        <div className={classnames(styles.footerAList, 'mb-2')}>
          <a
            href="https://www.mskcc.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            MSK <ExternalLinkIcon />
          </a>
          <a
            href="https://www.mskcc.org/research-areas/programs-centers/molecular-oncology"
            target="_blank"
            rel="noopener noreferrer"
          >
            CMO <ExternalLinkIcon />
          </a>
          <a
            href="https://www.cbioportal.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            cBioPortal <ExternalLinkIcon />
          </a>
          <OncoTreeLink />
        </div>
      </>
    );
  }

  public get internalLinks() {
    return (
      <>
        <div className={classnames(styles.footerAList, 'mb-2')}>
          <Link to="/terms">Terms of Use</Link>
          <ContactLink emailSubject={'Contact us'}>Contact Us</ContactLink>
          <a
            href="https://twitter.com/OncoKB"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <Linkout link={API_DOCUMENT_LINK}>API</Linkout>
        </div>
        <div className={classnames(styles.footerAList, 'mb-2')}>
          <Link to={PAGE_ROUTE.NEWS}>
            Last data update: {this.props.lastDataUpdate}
          </Link>
        </div>
      </>
    );
  }

  public render() {
    return (
      <footer className={classnames('footer', styles.footer)}>
        <Container>
          <Row className="text-center mb-4">
            <Col>{this.externalLinks}</Col>
          </Row>
          <Row className="text-center">
            <Col lg md={12} className={'mb-4'}>
              {this.internalLinks}
            </Col>
            <Col lg md={12}>
              <MskccLogo imageHeight={50} className="mb-2" />
            </Col>
            <Col lg md={12}>
              <div>
                &copy; {new Date().getFullYear()} Memorial Sloan Kettering
                Cancer Center
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
}

export default Footer;
