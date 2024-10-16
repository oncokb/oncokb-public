import React, { FunctionComponent, useState } from 'react';
import styles from './genetic-type.module.scss';
import classnames from 'classnames';
import { RouterStore } from 'mobx-react-router';
import { getGenePageLink } from 'app/shared/utils/UrlUtils';

export enum GENETIC_TYPE {
  SOMATIC = 'somatic',
  GERMLINE = 'germline',
}

const GeneticTypeTabs: FunctionComponent<{
  routing: RouterStore;
  hugoSymbol: string;
  geneticType?: GENETIC_TYPE;
  onChange: (status: string) => void;
}> = props => {
  const [selected, setSelected] = useState<GENETIC_TYPE>(
    props.geneticType || GENETIC_TYPE.SOMATIC
  );

  const ontoggle = (status: GENETIC_TYPE) => {
    setSelected(status);
    props.onChange(status);
  };

  return (
    <div className={styles.tabs}>
      {[GENETIC_TYPE.SOMATIC, GENETIC_TYPE.GERMLINE].map(geneOrigin => (
        <div
          style={{ width: '50%' }}
          className={
            selected === geneOrigin
              ? classnames(styles.tab, styles.selectedTab, 'font-bold')
              : classnames(styles.tab, styles.unselectedTab)
          }
          onClick={() => ontoggle(geneOrigin)}
        >
          {geneOrigin.substring(0, 1).toUpperCase()}
          {geneOrigin.toLowerCase().slice(1)}
        </div>
      ))}
    </div>
  );
};

export default GeneticTypeTabs;
