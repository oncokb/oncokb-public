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
      tooltipText = 'Data was added';
      break;
    case 'delete':
      label = 'Deletion';
      classname = styles.deletedTag;
      tooltipText = 'Data was removed';
      break;
    case 'update':
      label = 'Update';
      classname = styles.updatedTag;
      tooltipText = 'Data was changed';
      break;
    case 'name change':
      label = 'Name Change';
      classname = styles.choreTag;
      tooltipText =
        'The name of an alteration, cancer type, or treatment was changed';
      break;
    case 'demote':
      label = 'Downgrade to VUS';
      classname = styles.fixTag;
      tooltipText =
        'An alteration was demoted to a VUS (variant of unknown significance)';
      break;
    case 'promote':
      label = 'Upgrade from VUS';
      classname = styles.promotedTag;
      tooltipText =
        'A VUS (variant of unknown significance) was promoted to a curated alteration';
      break;
    default:
  }

  const tag = <span className={classname}>{label}</span>;
  if (showTooltip) {
    return <DefaultTooltip overlay={tooltipText}>{tag}</DefaultTooltip>;
  }
  return tag;
}
