import * as React from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import processImg from 'content/images/process.jpg';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { CitationText } from 'app/components/CitationText';
import { Link } from 'react-router-dom';
import {
  DOCUMENT_TITLES,
  SOP_LINK,
  WEBINAR_LINKS_05082020
} from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import { Linkout } from 'app/shared/links/Linkout';
import { observable } from 'mobx';
import Tabs from 'react-responsive-tabs';
import Iframe from 'react-iframe';
import * as QueryString from 'query-string';
import _ from 'lodash';

type AboutPageProps = { appStore: AppStore };
const ONCOKB_TUTORIAL = 'OncoKB Tutorial';
export const SHOW_MODAL_KEY = 'showModal';

@inject('appStore')
@observer
export class AboutPage extends React.Component<AboutPageProps> {
  @observable showModal = false;

  constructor(props: AboutPageProps) {
    super(props);
    const queryStrings = QueryString.parse(window.location.hash) as {
      showModal: string;
    };
    if (_.has(queryStrings, SHOW_MODAL_KEY)) {
      this.showModal = queryStrings.showModal === 'true';
    }
  }

  private tabs = [
    {
      title: 'YouTube.com',
      getContent: () => (
        <Iframe
          width="100%"
          height="600"
          url="https://www.youtube.com/embed/XqoKrrm2Boc"
          frameBorder={0}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></Iframe>
      ),
      key: 'youtube'
    },
    {
      title: 'bilibili.com',
      getContent: () => (
        <Iframe
          width="100%"
          height="600"
          url="//player.bilibili.com/player.html?aid=370552044&bvid=BV1pZ4y1s7ou&cid=188401136&page=1"
          frameBorder={0}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></Iframe>
      ),
      key: 'bilibili'
    }
  ];

  render() {
    return (
      <DocumentTitle title={DOCUMENT_TITLES.ABOUT}>
        <>
          <Row>
            <Col className="d-flex justify-content-between">
              <h2>About OncoKB</h2>
              <Button
                className={'mb-2'}
                onClick={() => (this.showModal = true)}
              >
                <span>{ONCOKB_TUTORIAL}</span>
                <i className={'fa fa-play-circle-o fa-lg ml-2'} />
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                OncoKB is a precision oncology knowledge base and contains
                information about the effects and treatment implications of
                specific cancer gene alterations. It is developed and maintained
                by the Knowledge Systems group in the{' '}
                <a
                  href="https://www.mskcc.org/research-areas/programs-centers/molecular-oncology"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Marie Josée and Henry R. Kravis Center for Molecular Oncology
                </a>{' '}
                at Memorial Sloan Kettering Cancer Center (MSK). Curated by a
                network of clinical fellows, research fellows, and faculty
                members at MSK, OncoKB contains detailed information about
                specific alterations in{' '}
                {this.props.appStore.mainNumbers.result.gene} cancer genes. The
                information is curated from various sources, such as guidelines
                from the FDA, NCCN, or ASCO,{' '}
                <a
                  href="https://clinicaltrials.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ClinicalTrials.gov
                </a>{' '}
                and the scientific literature.
              </p>
              <p>
                For each alteration, we have curated the biological effect,
                prevalence and prognostic information, as well as treatment
                implications. Treatment information is classified using the{' '}
                <Link to="/levels">Levels of Evidence</Link> system which
                assigns the clinical actionability (ranging from
                standard-of-care to investigational or hypothetical treatments)
                to individual mutational events. OncoKB currently contains
                treatment information for Level 1 and Level 2 (those alterations
                which are FDA-recognized or considered standard care biomarkers
                predictive of response to FDA-approved drugs in specific disease
                settings), Level 3 alterations (those alterations which are
                considered predictive of response based on promising clinical
                data to targeted agents being tested in clinical trials) and
                Level 4 (those alterations which are considered predictive of
                response based on compelling biological evidence to targeted
                agents being tested in clinical trials). For additional details
                about the OncoKB curation process, please refer to the version
                controlled{' '}
                <Linkout link={SOP_LINK}>
                  OncoKB Curation Standard Operating Procedure v1.1
                </Linkout>
                .
              </p>
              <p>
                To learn more about how to utilize OncoKB, watch our first
                OncoKB Webinar from May 7th, 2020 on {WEBINAR_LINKS_05082020}
              </p>
              <CitationText />
              <p>
                <img src={processImg} style={{ width: '100%' }} />
              </p>
            </Col>
          </Row>
          <Modal
            show={this.showModal}
            onHide={() => (this.showModal = false)}
            size={'xl'}
          >
            <Modal.Header closeButton>
              <Modal.Title>{ONCOKB_TUTORIAL}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tabs items={this.tabs} transform={false} />
            </Modal.Body>
          </Modal>
        </>
      </DocumentTitle>
    );
  }
}
