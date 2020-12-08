import { LevelButton } from 'app/components/levelButton/LevelButton';
import {
  COMPONENT_PADDING,
  LEVELS,
  LEVEL_BUTTON_DESCRIPTION,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVEL_TYPE_NAMES,
} from 'app/config/constants';
import React from 'react';
import { Button, Col, Collapse, Row } from 'react-bootstrap';
import classnames from 'classnames';

type LevelSelectionRowProps = {
  levelType: LEVEL_TYPES;
  collapseStatus: { [levelType: string]: boolean };
  levelNumbers: { [level: string]: number };
  levelSelected: { [level: string]: boolean };
  updateCollapseStatus: (levelType: LEVEL_TYPES) => void;
  updateLevelSelection: (level: string) => void;
};

export const LevelSelectionRow: React.FunctionComponent<LevelSelectionRowProps> = props => {
  const levelSelections = [];
  for (const level in LEVELS) {
    if (LEVELS[level]) {
      levelSelections.push(
        LEVEL_CLASSIFICATION[LEVELS[level]] ===
          LEVEL_TYPES[props.levelType] && (
          <Col
            className={classnames(...COMPONENT_PADDING)}
            lg={LEVEL_CLASSIFICATION[LEVELS[level]] === LEVEL_TYPES.TX ? 2 : 4}
            xs={LEVEL_CLASSIFICATION[LEVELS[level]] === LEVEL_TYPES.TX ? 6 : 4}
            key={LEVELS[level]}
          >
            <LevelButton
              level={LEVELS[level]}
              numOfGenes={props.levelNumbers[LEVELS[level]]}
              description={LEVEL_BUTTON_DESCRIPTION[LEVELS[level]]}
              active={props.levelSelected[LEVELS[level]]}
              className="mb-2"
              disabled={props.levelNumbers[LEVELS[level]] === 0}
              onClick={() => props.updateLevelSelection(LEVELS[level])}
            />
          </Col>
        )
      );
    }
  }
  return (
    <>
      <Row
        style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
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
            props.updateCollapseStatus(props.levelType);
          }}
          block
        >
          <div style={{ flexGrow: 0, marginRight: '0.5em' }}>
            {props.collapseStatus[props.levelType] ? (
              <i className="fa fa-minus"></i>
            ) : (
              <i className="fa fa-plus"></i>
            )}
            {props.collapseStatus[props.levelType] ? (
              <span>
                {' '}
                Click to hide {LEVEL_TYPE_NAMES[props.levelType]} Levels
              </span>
            ) : (
              <span>
                {' '}
                Click to show {LEVEL_TYPE_NAMES[props.levelType]} Levels
              </span>
            )}
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
      <Collapse in={props.collapseStatus[props.levelType]}>
        <Row
          style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
          className={'mb-2'}
        >
          {levelSelections}
        </Row>
      </Collapse>
    </>
  );
};
