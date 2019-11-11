import React from 'react';
import { Button } from 'react-bootstrap';
import { LEVEL_BUTTON_DESCRIPTION } from 'app/config/constants';
import pluralize from 'pluralize';
import * as styles from './LevelButton.module.scss';
import classnames from 'classnames';
import { inject } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';

type LevelButtonProps = {
  level: string;
  routing?: RouterStore;
  title?: string;
  numOfGenes: number;
  description: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  href?: string;
  disabled?: boolean;
};

export const LevelButton = inject('routing')((props: LevelButtonProps) => {
  const onClick = () => {
    if (props.href) {
      props.routing!.history.push(props.href);
    }
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <Button
      variant="light"
      onClick={onClick}
      active={props.active}
      href={props.href}
      disabled={props.disabled}
      className={classnames(
        props.href ? styles.levelButtonLink : styles.levelButton,
        props.className
      )}
    >
      <div
        className={classnames(`oncokb level-${props.level}`, styles.levelName)}
      >
        {props.title ? props.title : `Level ${props.level}`}
      </div>
      <div className={styles.levelDescription}>{props.description}</div>
      <div
        className={classnames(`oncokb level-${props.level}`, styles.geneNumber)}
      >{`${props.numOfGenes} ${pluralize('Gene', props.numOfGenes)}`}</div>
    </Button>
  );
});
