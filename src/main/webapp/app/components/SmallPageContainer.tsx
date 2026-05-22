import React from 'react';
import { Col, Row } from 'react-bootstrap';

const COL_SIZES = {
  sm: 4,
  md: 6,
  lg: 8,
} as const;

const SmallPageContainer: React.FunctionComponent<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = props => {
  return (
    <Row className={`justify-content-center ${props.className}`}>
      <Col lg={props.size ? COL_SIZES[props.size] : COL_SIZES.sm}>{props.children}</Col>
    </Row>
  );
};
export default SmallPageContainer;
