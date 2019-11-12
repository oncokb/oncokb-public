import React from 'react';
import { Col, Row } from 'react-bootstrap';

const SmallPageContainer: React.FunctionComponent<{
  size?: 'sm' | 'big';
  className?: string;
}> = props => {
  return (
    <Row className={`justify-content-center ${props.className}`}>
      <Col lg={props.size ? (props.size === 'sm' ? '6' : '8') : '6'}>
        {props.children}
      </Col>
    </Row>
  );
};
export default SmallPageContainer;
