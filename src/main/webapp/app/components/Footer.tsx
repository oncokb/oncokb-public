import * as React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import MskccLogo from './MskccLogo';

import styles from './Footer.module.scss';
import indexStyles from '../index.module.scss';
import { CitationText } from 'app/components/CitationText';
import classnames from 'classnames';
import { ONCOKB_CONTACT_EMAIL } from 'app/config/constants';

class Footer extends React.Component<{ lastUpdate: string }> {
  public get externalLinkIcon() {
    return <i className={'fa external-link-alt'} />;
  }

  public get externalLinks() {
    return (
      <>
        <div className={'mb-2'}>
          OncoKB is intended for research purposes only. Please review the{' '}
          <Link to={'/terms'} className={indexStyles.orange}>
            usage terms
          </Link>{' '}
          before continuing.
        </div>
        <div className={'mb-2'}>
          <CitationText highlightLinkout={true} />
        </div>
        <div className={classnames(styles.footerAList, 'mb-2')}>
          <a href="https://www.mskcc.org" target="_blank" rel="noopener noreferrer">
            MSK {this.externalLinkIcon}
          </a>
          <a href="https://www.mskcc.org/research-areas/programs-centers/molecular-oncology" target="_blank" rel="noopener noreferrer">
            CMO {this.externalLinkIcon}
          </a>
          <a href="http://www.questdiagnostics.com/home.html" target="_blank" rel="noopener noreferrer">
            Quest Diagnostics {this.externalLinkIcon}
          </a>
          <a href="https://www.cbioportal.org" target="_blank" rel="noopener noreferrer">
            cBioPortal {this.externalLinkIcon}
          </a>
          <a href="http://oncotree.mskcc.org" target="_blank" rel="noopener noreferrer">
            OncoTree {this.externalLinkIcon}
          </a>
        </div>
      </>
    );
  }

  public get internalLinks() {
    return (
      <>
        <div className={classnames(styles.footerAList, 'mb-2')}>
          <Link to="/terms">Usage Terms</Link>
          <a href={`mailto:${ONCOKB_CONTACT_EMAIL}`} target="_blank" rel="noopener noreferrer">
            Contact us
          </a>
          <a href="https://twitter.com/OncoKB" target="_blank" rel="noopener noreferrer">
            Twitter
          </a>
          <a href="api/v1/swagger-ui.html" target="_blank" rel="noopener noreferrer">
            API
          </a>
        </div>
        <div className={classnames(styles.footerAList, 'mb-2')}>
          <Link to="/news">Last update: {this.props.lastUpdate}</Link>
        </div>
      </>
    );
  }

  public render() {
    return (
      <footer className={classnames('footer', styles.footer)}>
        <Container>
          <Row className="text-center">
            <Col>{this.externalLinks}</Col>
          </Row>
          <Row className="text-center">
            <Col lg md={12}>
              {this.internalLinks}
            </Col>
            <Col lg md={12}>
              <MskccLogo imageHeight={50} className="mb-2" />
            </Col>
            <Col lg md={12}>
              <div>&copy; 2019 Memorial Sloan Kettering Cancer Center</div>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
}

export default Footer;
