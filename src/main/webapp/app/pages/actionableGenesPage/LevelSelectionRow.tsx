import { LevelButton } from 'app/components/levelButton/LevelButton';
import {
  ACTIONABLE_GENES_LEVEL_TITLE,
  COMPONENT_PADDING,
  LEVEL_BUTTON_DESCRIPTION,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPE_NAMES,
  LEVEL_TYPES,
  LEVELS,
  PAGE_ROUTE,
} from 'app/config/constants';
import React from 'react';
import { Button, Col, Collapse, Row } from 'react-bootstrap';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { FDA_L1_DISABLED_BTN_TOOLTIP } from 'app/pages/genePage/FdaUtils';
import { Link } from 'react-router-dom';
import { Version } from 'app/pages/LevelOfEvidencePage';

type LevelSelectionRowProps = {
  levelType: LEVEL_TYPES;
  collapseStatus: { [levelType: string]: boolean };
  levelNumbers: { [level: string]: number };
  levelSelected: { [level: string]: boolean };
  updateCollapseStatus: (levelType: LEVEL_TYPES) => void;
  updateLevelSelection: (level: string) => void;
  isLoading: boolean;
};

@observer
export default class LevelSelectionRow extends React.Component<
  LevelSelectionRowProps,
  any
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
            lg={LEVEL_CLASSIFICATION[LEVELS[level]] === LEVEL_TYPES.TX ? 2 : 4}
            xs={LEVEL_CLASSIFICATION[LEVELS[level]] === LEVEL_TYPES.TX ? 6 : 4}
            key={LEVELS[level]}
          >
            <LevelButton
              title={
                this.props.levelType === LEVEL_TYPES.FDA
                  ? `FDA Level ${level.replace('FDAx', '')}`
                  : ''
              }
              level={LEVELS[level]}
              numOfGenes={this.props.levelNumbers[LEVELS[level]]}
              description={LEVEL_BUTTON_DESCRIPTION[LEVELS[level]]}
              active={this.props.levelSelected[LEVELS[level]]}
              className="mb-2"
              disabled={this.props.levelNumbers[LEVELS[level]] === 0}
              disabledTooltip={
                LEVELS[level] === LEVELS.FDAx1
                  ? FDA_L1_DISABLED_BTN_TOOLTIP
                  : ''
              }
              isLoading={this.props.isLoading}
              onClick={() => this.props.updateLevelSelection(LEVELS[level])}
            />
          </Col>
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
              this.props.updateCollapseStatus(this.props.levelType);
            }}
            block
          >
            <div style={{ flexGrow: 0, marginRight: '0.5em' }}>
              {this.props.collapseStatus[this.props.levelType] ? (
                <i className="fa fa-minus mr-2"></i>
              ) : (
                <i className="fa fa-plus mr-2"></i>
              )}
              <span>{ACTIONABLE_GENES_LEVEL_TITLE[this.props.levelType]}</span>
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
          <div>
            {this.props.levelType === LEVEL_TYPES.FDA && (
              <Row>
                <Col>
                  <>
                    <p>
                      While the intended audience for OncoKB is primarily
                      clinical oncologists, molecular pathologists and cancer
                      researchers, tumor profiling next generation sequencing
                      (NGS) test developers may also rely on human variant
                      databases such as OncoKB for variant information to
                      support the clinical validity of their tests. Therefore,
                      to credential the robustness and transparency of databases
                      involved in variant evaluation, the FDA introduced a
                      process to recognize human variant databases.
                    </p>
                    <p>
                      Below is the FDA-recognized content (under review) in
                      OncoKB, including tumor type-specific alterations and
                      their corresponding{' '}
                      <Link
                        to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA_NGS}`}
                      >
                        FDA level of evidence
                      </Link>
                      . The assigned FDA level of evidence is based on these
                      alterations being tested in Formalin Fixed Paraffin
                      Embedded (FFPE) specimen types, except in cases where
                      specimen type is not specified.Below is the FDA-recognized
                      content(under FDA review) in
                    </p>
                  </>
                </Col>
              </Row>
            )}
            <Row
              style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
              className={'mb-2'}
            >
              {levelSelections}
            </Row>
          </div>
        </Collapse>
      </>
    );
  }
}
