import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import oncokbImg from 'content/images/level_v2.jpg';
import oncokbImgPpt from 'content/files/levelOfEvidence/v2/LevelsOfEvidence.ppt';
import oncokbImgPdf from 'content/files/levelOfEvidence/v2/LevelsOfEvidence.pdf';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';

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
          <img style={{ maxWidth: 600, width: '100%' }} src={oncokbImg} />
        </Col>
      </Row>
    </div>
  );
};
