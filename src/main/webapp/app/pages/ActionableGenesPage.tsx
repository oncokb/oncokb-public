import React from 'react';
import { observer, inject } from 'mobx-react';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { Col, Row } from 'react-bootstrap';
import classnames from 'classnames';

@inject('routing')
@observer
export default class ActionableGenesPage extends React.Component<{}> {
  private levels = [1, 2, 3, 4, 'R1', 'R2'];

  render() {
    return (
      <Row style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
        {this.levels.map(level => (
          <Col className={classnames('pl-2', 'pr-2')} lg={2} xs={4}>
            <LevelButton level={level} numOfGenes={2} active={false} className="mb-2" />
          </Col>
        ))}
      </Row>
    );
  }
}
