import React from 'react';
import { Button } from 'react-bootstrap';
import { LEVEL_BUTTON_DESCRIPTION } from 'app/config/constants';
import pluralize from 'pluralize';
import * as styles from './LevelButton.module.scss';
import classnames from 'classnames';
import _ from 'lodash';

export interface LevelButton {
  levelOfEvidence: string;
  numOfGenes: number;
  onClick: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

export const LevelButton = (props: LevelButton) => {
  let level = props.levelOfEvidence.replace('LEVEL_', '');
  return (
    <Button
      variant="light"
      onClick={props.onClick}
      active={props.active}
      disabled={props.disabled}
      className={classnames(styles.levelButton, props.className)}
    >
      <div className={`oncokb level-${level}`}>Level {level}</div>
      <div>{LEVEL_BUTTON_DESCRIPTION[level]}</div>
      <div className={`oncokb level-${level}`}>{`${props.numOfGenes} ${pluralize('Gene', props.numOfGenes)}`}</div>
    </Button>
  );
};
