import React, { CSSProperties } from 'react';
import { Button } from 'react-bootstrap';
import { LEVEL_BUTTON_DESCRIPTION, LEVELS } from 'app/config/constants';
import pluralize from 'pluralize';
import * as styles from './LevelButton.module.scss';
import classnames from 'classnames';
import { inject } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import { OncoKBLevelIcon } from 'app/shared/utils/Utils';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';

type LevelButtonProps = {
  level: LEVELS;
  routing?: RouterStore;
  title?: string;
  numOfGenes: number;
  description: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  active?: boolean;
  href?: string;
  disabled?: boolean;
  isLoading?: boolean;
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
      style={props.style}
      className={classnames(
        props.href ? styles.levelButtonLink : styles.levelButton,
        props.className
      )}
    >
      <div
        className={classnames(
          `oncokb level-${props.level} d-flex justify-content-center align-items-center`,
          styles.levelName
        )}
      >
        <OncoKBLevelIcon level={props.level} withDescription={true} />
        <span className={'ml-1 mr-4'}>
          {props.title ? props.title : `Level ${props.level}`}
        </span>
      </div>
      <div className={styles.levelDescription}>{props.description}</div>
      {props.isLoading ? (
        <LoadingIndicator isLoading size={LoaderSize.EXTRA_SMALL} />
      ) : (
        <div
          className={classnames(
            `oncokb level-${props.level}`,
            styles.geneNumber
          )}
        >{`${props.numOfGenes} ${pluralize('Gene', props.numOfGenes)}`}</div>
      )}
    </Button>
  );
});
