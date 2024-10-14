import React from 'react';
import { Col, Row } from 'react-bootstrap';

const PageContainer: React.FunctionComponent<{
  className?: string;
}> = props => {
  return (
    <Row className={`justify-content-center ${props.className}`}>
      <Col>{props.children}</Col>
    </Row>
  );
};
export default PageContainer;
