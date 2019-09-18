import React from 'react';
import { Button } from 'react-bootstrap';
import { LEVEL_BUTTON_DESCRIPTION } from 'app/config/constants';
import pluralize from 'pluralize';
import * as styles from './LevelButton.module.scss';
import classnames from 'classnames';

export const LevelButton = (props: { level: string | number; className?: string; numOfGenes: number; active: boolean }) => {
  return (
    <Button variant="light" className={classnames(styles.levelButton, props.className)}>
      <div className={`oncokb level-${props.level}`}>Level {props.level}</div>
      <div>{LEVEL_BUTTON_DESCRIPTION[props.level]}</div>
      <div className={`oncokb level-${props.level}`}>{`${props.numOfGenes} ${pluralize('Gene', props.numOfGenes)}`}</div>
    </Button>
  );
};
