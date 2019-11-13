import React from 'react';
import { Col, Row } from 'react-bootstrap';

const PageContainer: React.FunctionComponent<{
  className?: string;
}> = props => {
  return (
    <Row className={`justify-content-center ${props.className}`}>
      <Col xl={10} lg={11}>
        {props.children}
      </Col>
    </Row>
  );
};
export default PageContainer;
