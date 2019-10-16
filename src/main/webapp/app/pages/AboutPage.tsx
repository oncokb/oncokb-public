import * as React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import questImg from 'content/images/quest.png';
import processImg from 'content/images/process.jpg';
import AppStore from 'app/store/AppStore';
import { inject } from 'mobx-react';
import { CitationText } from 'app/components/CitationText';
import { Link } from 'react-router-dom';

type AboutPageProps = { appStore: AppStore };
export const AboutPage: React.FunctionComponent<AboutPageProps> = inject('appStore')((props: AboutPageProps) => {
  return (
    <>
      <Row>
        <Col className="d-flex align-items-center">
          <h2>About OncoKB</h2>
          <span className={'ml-auto d-flex align-items-center'}>
            <span>Developed in partnership with</span>
            <Button variant="link" href="https://questdiagnostics.com/home.html">
              <img style={{ height: 50 }} src={questImg} />
            </Button>
          </span>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
            OncoKB is a precision oncology knowledge base and contains information about the effects and treatment implications of specific
            cancer gene alterations. It is developed and maintained by the Knowledge Systems group in the{' '}
            <a href="https://www.mskcc.org/research-areas/programs-centers/molecular-oncology" target="_blank" rel="noopener noreferrer">
              Marie Josée and Henry R. Kravis Center for Molecular Oncology
            </a>{' '}
            at Memorial Sloan Kettering Cancer Center (MSK), in partnership with Quest Diagnostics and Watson for Genomics, IBM.
          </p>
          <p>
            Curated by a network of clinical fellows, research fellows, and faculty members at MSK, OncoKB contains detailed information
            about specific alterations in {props.appStore.mainNumbers.result.gene} cancer genes. The information is curated from various
            sources, such as guidelines from the FDA, NCCN, or ASCO,{' '}
            <a href="https://clinicaltrials.gov/" target="_blank" rel="noopener noreferrer">
              ClinicalTrials.gov
            </a>
            and the scientific literature.
          </p>
          <p>
            For each alteration, we have curated the biological effect, prevalence and prognostic information, as well as treatment
            implications. Treatment information is classified using the <Link to="/levels">Levels of Evidence</Link> system which assigns
            the clinical actionability (ranging from standard-of-care to investigational or hypothetical treatments) to individual
            mutational events. OncoKB currently contains treatment information for Level 1 and Level 2 (those alterations which are
            FDA-recognized or considered standard care biomarkers predictive of response to FDA-approved drugs in specific disease
            settings), Level 3 alterations (those alterations which are considered predictive of response based on promising clinical data
            to targeted agents being tested in clinical trials) and Level 4 (those alterations which are considered predictive of response
            based on compelling biological evidence to targeted agents being tested in clinical trials).
          </p>
          <CitationText />
          <p>
            <img src={processImg} style={{ width: '100%' }} />
          </p>
        </Col>
      </Row>
    </>
  );
});
