import React from 'react';
import { Col, Row } from 'react-bootstrap';

const SmallPageContainer: React.FunctionComponent<{
  className?: string;
}> = props => {
  return (
    <Row className={`justify-content-center ${props.className}`}>
      <Col lg={6}>{props.children}</Col>
    </Row>
  );
};
export default SmallPageContainer;
