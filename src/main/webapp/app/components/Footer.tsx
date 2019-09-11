import * as React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import MskccLogo from './MskccLogo';

import styles from './Footer.module.scss';
import indexStyles from '../index.module.scss';
import { CitationText } from 'app/components/CitationText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Footer extends React.Component<{ lastUpdate: string }> {
  public get externalLinkIcon() {
    return <FontAwesomeIcon icon={'external-link-alt'} />;
  }

  public get externalLinks() {
    return (
      <>
        <div className={'mb-2'}>
          OncoKB is intended for research purposes only. Please review the{' '}
          <Link to={'/terms'}>
            <u className={indexStyles.orange}>usage terms</u>
          </Link>
          before continuing.
        </div>
        <div className={'mb-2'}>
          <CitationText highlightLinkout={true} />
        </div>
        <div className={styles.footerAList}>
          <a href="https://www.mskcc.org" target="_blank">
            MSK {this.externalLinkIcon}
          </a>
          <a href="https://www.mskcc.org/research-areas/programs-centers/molecular-oncology" target="_blank">
            CMO {this.externalLinkIcon}
          </a>
          <a href="http://www.questdiagnostics.com/home.html" target="_blank">
            Quest Diagnostics {this.externalLinkIcon}/>
          </a>
          <a href="https://www.cbioportal.org" target="_blank">
            cBioPortal {this.externalLinkIcon}
          </a>
          <a href="http://oncotree.mskcc.org" target="_blank">
            OncoTree {this.externalLinkIcon}
          </a>
        </div>
      </>
    );
  }

  public get internalLinks() {
    return (
      <>
        <div className={styles.footerAList}>
          <Link to="/terms">Usage Terms</Link>
          <a href="mailto:contact@oncokb.org" target="_blank">
            Contact us
          </a>
          <a href="https://twitter.com/OncoKB" target="_blank">
            Twitter
          </a>
          <a href="api/v1/swagger-ui.html" target="_blank">
            API
          </a>
        </div>
        <div className={styles.footerAList}>
          <Link to="/news">Last update: {this.props.lastUpdate}</Link>
        </div>
      </>
    );
  }

  public render() {
    return (
      <footer className={styles.footer}>
        <Container>
          <Row className="text-center">
            <Col>{this.externalLinks}</Col>
          </Row>
          <Row className="text-center">
            <Col md className="m-auto">
              {this.internalLinks}
            </Col>
            <Col md className="m-auto">
              <MskccLogo imageHeight={50} />
            </Col>
            <Col md className="m-auto">
              <div>&copy; 2019 Memorial Sloan Kettering Cancer Center</div>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }
}

export default Footer;
