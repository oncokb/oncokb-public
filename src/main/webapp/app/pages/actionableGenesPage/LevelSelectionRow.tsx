import {LevelButton} from 'app/components/levelButton/LevelButton';
import {
  COMPONENT_PADDING,
  LEVEL_BUTTON_DESCRIPTION,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPE_NAMES,
  LEVEL_TYPES,
  LEVELS,
} from 'app/config/constants';
import React from 'react';
import {Button, Col, Collapse, Row} from 'react-bootstrap';
import classnames from 'classnames';
import {observer} from 'mobx-react';
import {FDA_L1_DISABLED_BTN_TOOLTIP} from "app/pages/genePage/FdaUtils";

type LevelSelectionRowProps = {
  levelType: LEVEL_TYPES;
  collapseStatus: { [levelType: string]: boolean };
  levelNumbers: { [level: string]: number };
  levelSelected: { [level: string]: boolean };
  updateCollapseStatus: (levelType: LEVEL_TYPES) => void;
  updateLevelSelection: (level: string) => void;
};

@observer
export default class LevelSelectionRow extends React.Component<
  LevelSelectionRowProps, any
> {
  render() {
    const levelSelections = [];
    for (const level in LEVELS) {
      if (
        LEVELS[level] &&
        ![LEVELS.Tx3A, LEVELS.Tx3B].includes(LEVELS[level]) &&
        LEVEL_CLASSIFICATION[LEVELS[level]] === this.props.levelType
      ) {
        levelSelections.push(
            <Col
              className={classnames(...COMPONENT_PADDING)}
              lg={
                LEVEL_CLASSIFICATION[LEVELS[level]] === LEVEL_TYPES.TX ? 2 : 4
              }
              xs={
                LEVEL_CLASSIFICATION[LEVELS[level]] === LEVEL_TYPES.TX ? 6 : 4
              }
              key={LEVELS[level]}
            >
              <LevelButton
                title={this.props.levelType === LEVEL_TYPES.FDA ? `FDA Level ${level.replace('FDAx', '')}` : ''}
                level={LEVELS[level]}
                numOfGenes={this.props.levelNumbers[LEVELS[level]]}
                description={LEVEL_BUTTON_DESCRIPTION[LEVELS[level]]}
                active={this.props.levelSelected[LEVELS[level]]}
                className="mb-2"
                disabled={this.props.levelNumbers[LEVELS[level]] === 0}
                disabledTooltip={LEVELS[level] === LEVELS.FDAx1 ? FDA_L1_DISABLED_BTN_TOOLTIP : ''}
                onClick={() => this.props.updateLevelSelection(LEVELS[level])}
              />
            </Col>

        );
      }
    }
    return this.props.levelType !== LEVEL_TYPES.FDA ? (
      <>
        <Row
          style={{paddingLeft: '1rem', paddingRight: '1rem'}}
          className={'mb-2'}
        >
          <Button
            style={{
              backgroundColor: 'white',
              border: 0,
              textAlign: 'left',
              paddingLeft: 0,
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            variant="light"
            onClick={() => {
              this.props.updateCollapseStatus(this.props.levelType);
            }}
            block
          >
            <div style={{flexGrow: 0, marginRight: '0.5em'}}>
              {this.props.collapseStatus[this.props.levelType] ? (
                <i className="fa fa-minus mr-2"></i>
              ) : (
                <i className="fa fa-plus mr-2"></i>
              )}
              <span>
              {LEVEL_TYPE_NAMES[this.props.levelType]} Levels{' '}
                {[LEVEL_TYPES.DX, LEVEL_TYPES.PX].includes(this.props.levelType)
                  ? '(for hematologic malignancies only)'
                  : ''}
            </span>
            </div>
            <div
              style={{
                flexGrow: 1,
                height: '0.5px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }}
            ></div>
          </Button>
        </Row>
        <Collapse in={this.props.collapseStatus[this.props.levelType]}>
          <Row
            style={{paddingLeft: '0.5rem', paddingRight: '0.5rem'}}
            className={'mb-2'}
          >
            {levelSelections}
          </Row>
        </Collapse>

      </>
    ) : (
      <Row
        style={{paddingLeft: '0.5rem', paddingRight: '0.5rem'}}
        className={'mb-2'}
      >
        {levelSelections}
      </Row>
    );
  }
}
