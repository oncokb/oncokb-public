import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import oncokbImg from 'content/images/level_v1.jpg';
import oncokbImgPpt from 'content/files/levelOfEvidence/v1/LevelsOfEvidence.ppt';
import oncokbImgPdf from 'content/files/levelOfEvidence/v1/LevelsOfEvidence.pdf';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import { DOCUMENT_TITLES, IMG_MAX_WIDTH } from 'app/config/constants';
import DocumentTitle from 'react-document-title';

export const LevelOfEvidencePage = () => {
  return (
    <DocumentTitle title={DOCUMENT_TITLES.LEVELS}>
      <div>
        <Row>
          <Col className={'d-flex justify-content-end'}>
            <Button
              size={'sm'}
              className={classnames('ml-1')}
              href={oncokbImgPpt}
            >
              <i className={'fa fa-cloud-download mr-1'} />
              Download Slide
            </Button>
            <DownloadButton
              size={'sm'}
              className={classnames('ml-1')}
              href={oncokbImgPdf}
            >
              <i className={'fa fa-cloud-download mr-1'} />
              Download PDF
            </DownloadButton>
          </Col>
        </Row>
        <Row>
          <Col className={'d-sm-block d-md-flex justify-content-center'}>
            <img
              style={{ maxWidth: IMG_MAX_WIDTH, width: '100%' }}
              src={oncokbImg}
            />
          </Col>
        </Row>
      </div>
    </DocumentTitle>
  );
};
