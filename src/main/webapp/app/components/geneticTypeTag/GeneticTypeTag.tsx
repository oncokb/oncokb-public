import React, { FunctionComponent } from 'react';
import { GENETIC_TYPE } from 'app/components/geneticTypeTabs/GeneticTypeTabs';
import classnames from 'classnames';
import styles from './genetic-type-tag.module.scss';
import { capitalize } from 'cbioportal-frontend-commons';

const GeneticTypeTag: FunctionComponent<{
  geneticType: GENETIC_TYPE;
  className?: string;
}> = props => {
  return (
    <span
      className={classnames(
        props.className,
        props.geneticType === GENETIC_TYPE.GERMLINE
          ? styles.germlineTag
          : styles.somaticTag
      )}
    >
      {capitalize(props.geneticType)}
    </span>
  );
};

export default GeneticTypeTag;
