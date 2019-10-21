import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import oncokbImg from 'content/images/level_v1.jpg';
import oncokbImgPpt from 'content/files/levelOfEvidence/v1/LevelsOfEvidence.ppt';
import oncokbImgPdf from 'content/files/levelOfEvidence/v1/LevelsOfEvidence.pdf';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';
import { IMG_MAX_WIDTH } from 'app/config/constants';

export const LevelOfEvidencePage = () => {
  return (
    <div>
      <Row>
        <Col className={'d-flex justify-content-end'}>
          <Button size={'sm'} className={classnames('ml-1')} href={oncokbImgPpt}>
            <i className={'fa fa-cloud-download mr-1'} />
            Download Slide
          </Button>
          <DownloadButton size={'sm'} className={classnames('ml-1')} href={oncokbImgPdf}>
            <i className={'fa fa-cloud-download mr-1'} />
            Download PDF
          </DownloadButton>
        </Col>
      </Row>
      <Row>
        <Col className={'d-flex justify-content-center'}>
          <img style={{ maxWidth: IMG_MAX_WIDTH, width: '100%' }} src={oncokbImg} />
        </Col>
      </Row>
    </div>
  );
};
