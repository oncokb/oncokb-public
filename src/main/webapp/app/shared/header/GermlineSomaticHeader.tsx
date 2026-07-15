import React from 'react';
import classnames from 'classnames';
import { FeedbackType } from 'app/components/feedback/types';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import styles from './GermlineSomaticHeader.module.scss';
import AppStore from 'app/store/AppStore';
import GeneticTypeTag from 'app/components/tag/GeneticTypeTag';
import InvalidVariantTag from 'app/components/tag/InvalidVariantTag';
export default function GermlineSomaticHeader({
  includeEmailLink,
  annotation,
  appStore,
  alteration,
  proteinAlteration,
  isGermline,
  isInvalid,
  extra,
}: {
  includeEmailLink: boolean;
  appStore: AppStore;
  alteration: string;
  proteinAlteration?: string;
  annotation: Parameters<typeof FeedbackIcon>[0]['feedback']['annotation'];
  isGermline: boolean;
  isInvalid?: boolean;
  extra?: React.ReactNode;
}) {
  const normalizedProteinAlteration =
    proteinAlteration && !proteinAlteration.startsWith('p.')
      ? `p.${proteinAlteration}`
      : proteinAlteration;
  return (
    <h1 className={classnames(styles.header, 'h2')}>
      <div
        className={classnames(
          styles.headerContent,
          proteinAlteration ? styles.col4 : undefined
        )}
      >
        <span
          className={classnames(styles.headerContentGene, styles.centerContent)}
        >
          {annotation?.gene}
        </span>
        <span className={classnames(styles.headerContentGene)}>
          {alteration}
        </span>
        {proteinAlteration && (
          <span className={classnames(styles.headerContentGene)}>
            {`(${normalizedProteinAlteration})`}
          </span>
        )}
        <span className={classnames(styles.extraContent, styles.centerContent)}>
          {isInvalid && <InvalidVariantTag />}
          <GeneticTypeTag isGermline={isGermline} />
          {extra}
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
        </span>
      </div>
    </h1>
  );
}
