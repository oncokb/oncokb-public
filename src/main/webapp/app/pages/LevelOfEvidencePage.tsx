import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import oncokbImg from '../resources/images/level.jpg';
import oncokbImgPpt from '../resources/files/LevelsOfEvidence.ppt';
import oncokbImgPdf from '../resources/files/LevelsOfEvidence.pdf';
import { DownloadButton } from 'app/components/downloadButton/DownloadButton';

export const LevelOfEvidencePage = () => {
  return (
    <div>
      <Row>
        <Col className={'d-flex justify-content-end'}>
          <Button size={'sm'} className={classnames('ml-1')} href={oncokbImgPpt}>
            <FontAwesomeIcon icon={'cloud-download-alt'} className={'mr-1'} fixedWidth />
            Download Slide
          </Button>
          <DownloadButton size={'sm'} className={classnames('ml-1')} href={oncokbImgPdf}>
            <FontAwesomeIcon icon={'cloud-download-alt'} className={'mr-1'} fixedWidth />
            Download PDF
          </DownloadButton>
        </Col>
      </Row>
      <Row>
        <Col className={'d-flex justify-content-center'}>
          <img style={{ maxWidth: 800, width: '100%' }} src={oncokbImg} />
        </Col>
      </Row>
    </div>
  );
};
