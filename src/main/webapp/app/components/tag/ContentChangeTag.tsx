import React from 'react';

import styles from './tag.module.scss';
import { ContentFieldChangeOperation } from 'app/pages/newsPage/NewsPage';

export interface IContentChangeTagProps {
  type: ContentFieldChangeOperation;
}

export default function ContentChangeTag({ type }: IContentChangeTagProps) {
  let label = '';
  let classname = '';
  switch (type) {
    case 'Added':
      label = 'Addition';
      classname = styles.featureTag;
      break;
    case 'Deleted':
      label = 'Deletion';
      classname = styles.deletedTag;
      break;
    case 'Updated':
      label = 'Update';
      classname = styles.updatedTag;
      break;
    case 'Name Changed':
      label = 'Name Change';
      classname = styles.choreTag;
      break;
    case 'Demoted':
      label = 'Demotion';
      classname = styles.fixTag;
      break;
    case 'Promoted':
      label = 'Promotion';
      classname = styles.promotedTag;
      break;
    default:
  }

  return <span className={classname}>{label}</span>;
}
