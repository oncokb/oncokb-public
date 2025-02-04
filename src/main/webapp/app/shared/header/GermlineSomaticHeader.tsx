import React from 'react';
import { upperFirst } from '../utils/LodashUtils';
import classnames from 'classnames';
import { FeedbackType } from 'app/components/feedback/types';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import styles from './GermlineSomaticHeader.module.scss';
import AppStore from 'app/store/AppStore';
import { AnnotationStore } from 'app/store/AnnotationStore';
import { GENETIC_TYPE } from 'app/components/geneticTypeTabs/GeneticTypeTabs';
export default function GermlineSomaticHeader({
  includeEmailLink,
  annotation,
  appStore,
  alterationNameWithDiff,
  geneticType,
}: {
  includeEmailLink: boolean;
  appStore: AppStore;
  alterationNameWithDiff: AnnotationStore['alterationNameWithDiff'];
  annotation: Parameters<typeof FeedbackIcon>[0]['feedback']['annotation'];
  geneticType: GENETIC_TYPE;
} & {}) {
  return (
    <h1 className={classnames(styles.header)}>
      <div className={classnames(styles.headerContent)}>
        {annotation?.gene} {alterationNameWithDiff}{' '}
        <span
          className={classnames(
            styles.pill,
            geneticType === GENETIC_TYPE.GERMLINE
              ? styles.germline
              : styles.somatic
          )}
        >
          {upperFirst(geneticType)}
        </span>
        <span style={{ fontSize: '0.5em' }} className={'ml-2'}>
          {includeEmailLink && (
            <FeedbackIcon
              feedback={{
                type: FeedbackType.ANNOTATION,
                annotation,
              }}
              appStore={appStore}
            />
          )}
        </span>
      </div>
    </h1>
  );
}
