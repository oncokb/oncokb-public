import React from 'react';
import styles from './tag.module.scss';
import classnames from 'classnames';

export interface IComingSoonTagProps {
  size?: 'sm' | 'lg';
  className?: string;
}

export default function ComingSoonTag({
  size = 'sm',
  className,
}: IComingSoonTagProps) {
  return (
    <span
      className={classnames(
        size === 'sm' ? styles.comingSoonTagSmall : styles.comingSoonTagLarge,
        className
      )}
    >
      Coming Soon!
    </span>
  );
}
