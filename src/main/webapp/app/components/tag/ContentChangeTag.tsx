import React from 'react';

import styles from './tag.module.scss';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

const contentFieldChangeOperations = [
  'add',
  'delete',
  'update',
  'name change',
  'demote',
  'promote',
] as const;
export type ContentFieldChangeOperation = typeof contentFieldChangeOperations[number];

export interface IContentChangeTagProps {
  type: ContentFieldChangeOperation;
  showTooltip?: boolean;
}

export default function ContentChangeTag({
  type,
  showTooltip = false,
}: IContentChangeTagProps) {
  let label = '';
  let classname = '';
  let tooltipText = '';
  switch (type) {
    case 'add':
      label = 'Addition';
      classname = styles.featureTag;
      tooltipText =
        'New content was added, either a new entry or a field that was previously empty.';
      break;
    case 'delete':
      label = 'Deletion';
      classname = styles.deletedTag;
      tooltipText = 'Existing content was removed.';
      break;
    case 'update':
      label = 'Update';
      classname = styles.updatedTag;
      tooltipText =
        'Existing content was revised. Old and new values are shown below.';
      break;
    case 'name change':
      label = 'Name Change';
      classname = styles.choreTag;
      tooltipText =
        'A gene, alteration, cancer type, or treatment was renamed. The underlying annotation is unchanged.';
      break;
    case 'demote':
      label = 'Downgrade to VUS';
      classname = styles.fixTag;
      tooltipText =
        'A curated alteration was reclassified as a variant of unknown significance (VUS).';
      break;
    case 'promote':
      label = 'Upgrade from VUS';
      classname = styles.promotedTag;
      tooltipText =
        'An alteration previously listed as a VUS was curated and now has a biological and oncogenic effect.';
      break;
    default:
  }

  const tag = <span className={classname}>{label}</span>;
  if (showTooltip) {
    return <DefaultTooltip overlay={tooltipText}>{tag}</DefaultTooltip>;
  }
  return tag;
}
