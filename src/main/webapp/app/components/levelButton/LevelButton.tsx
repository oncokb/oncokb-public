import React from 'react';
import { Button } from 'react-bootstrap';
import { LEVEL_BUTTON_DESCRIPTION } from 'app/config/constants';
import pluralize from 'pluralize';
import * as styles from './LevelButton.module.scss';
import classnames from 'classnames';

type LevelButtonProps = {
  level: string;
  numOfGenes: number;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  href?: string;
  disabled?: boolean;
};

export const LevelButton = (props: LevelButtonProps) => {
  return (
    <Button
      variant="light"
      onClick={props.onClick}
      active={props.active}
      href={props.href}
      disabled={props.disabled}
      className={classnames(props.href ? styles.levelButtonLink : styles.levelButton, props.className)}
    >
      <div className={classnames(`oncokb level-${props.level}`, styles.levelName)}>Level {props.level}</div>
      <div className={styles.levelDescription}>{LEVEL_BUTTON_DESCRIPTION[props.level]}</div>
      <div className={classnames(`oncokb level-${props.level}`, styles.geneNumber)}>{`${props.numOfGenes} ${pluralize(
        'Gene',
        props.numOfGenes
      )}`}</div>
    </Button>
  );
};
