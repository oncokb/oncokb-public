import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';
import classnames from 'classnames';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import { IMG_MAX_WIDTH, ONCOKB_TM } from 'app/config/constants';
import DocumentTitle from 'react-document-title';
import OptimizedImage from 'app/shared/image/OptimizedImage';
import { getPageTitle } from 'app/shared/utils/Utils';
import { ElementType } from 'app/components/SimpleTable';
import { Version } from './LevelOfEvidencePage';

interface DxPxLevelsPageProps {
  pageTitle: string;
  version: string;
}

const LEVEL_TITLE: { [key in Version]?: ElementType } = {
  [Version.DX]: <>${ONCOKB_TM} Diagnostic Levels of Evidence</>,
  [Version.PX]: <>${ONCOKB_TM} Prognostic Levels of Evidence</>,
};

export default class DxPxLevelsPage extends React.Component<
  DxPxLevelsPageProps
> {
  render() {
    const linkName =
      this.props.version === Version.DX
        ? 'Prognostic Levels'
        : 'Diagnostic Levels';

    const link =
      this.props.version === Version.DX
        ? PAGE_ROUTE.PX_LEVELS
        : PAGE_ROUTE.DX_LEVELS;

    return (
      <DocumentTitle title={getPageTitle(this.props.pageTitle)}>
        <>
          <div className="mb-4 d-flex font-bold">
            <Link to={PAGE_ROUTE.LEVELS} className="mr-5">
              Therapeutic Levels
            </Link>
            <Link to={link}>{linkName}</Link>
          </div>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="levels-of-evidence">
                <Row className="mt-2">
                  <Col className="col-auto mr-auto d-flex align-content-center"></Col>
                  <Col className={'col-auto'}>
                    <Button
                      size={'sm'}
                      className={classnames('ml-1')}
                      href={`content/files/levelOfEvidence/${this.props.version}/LevelsOfEvidence.ppt`}
                    >
                      <i className={'fa fa-cloud-download mr-1'} />
                      Download Slide
                    </Button>
                    <DownloadButton
                      size={'sm'}
                      className={classnames('ml-1')}
                      href={`content/files/levelOfEvidence/${this.props.version}/LevelsOfEvidence.pdf`}
                    >
                      <i className={'fa fa-cloud-download mr-1'} />
                      Download PDF
                    </DownloadButton>
                  </Col>
                </Row>
                <Row className={'justify-content-md-center mt-5'}>
                  <Col className={'col-md-auto text-center'}>
                    <h4>{LEVEL_TITLE[this.props.version]}</h4>
                  </Col>
                </Row>
                <Row>
                  <Col className={'d-md-flex justify-content-center mt-2'}>
                    <div
                      style={{
                        maxWidth: IMG_MAX_WIDTH,
                      }}
                    >
                      <OptimizedImage
                        style={{ width: '100%' }}
                        progressiveLoading
                        src={`content/images/level_${this.props.version}.png`}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </>
      </DocumentTitle>
    );
  }
}
