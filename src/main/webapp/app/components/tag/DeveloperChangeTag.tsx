import React from 'react';

import styles from './tag.module.scss';
import { DeveloperPullRequest } from 'app/shared/api/generated/API';

export interface IDeveloperChangeTagProps {
  type: DeveloperPullRequest['type'];
}

export default function DeveloperChangeTag({ type }: IDeveloperChangeTagProps) {
  let label = '';
  let classname = '';
  switch (type) {
    case 'feat':
      label = 'Feature';
      classname = styles.featureTag;
      break;
    case 'fix':
      label = 'Fix';
      classname = styles.fixTag;
      break;
    case 'chore':
      label = 'Chore';
      classname = styles.choreTag;
      break;
    default:
  }

  return <span className={classname}>{label}</span>;
}
