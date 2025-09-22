import React from 'react';
import { AlleleState } from 'app/config/constants';
import { capitalize } from 'cbioportal-frontend-commons';
import styles from './tag.module.scss';

export interface IAlleleStateTagProps {
  alleleState: AlleleState;
}

export default function AlleleStateTag({ alleleState }: IAlleleStateTagProps) {
  return (
    <span
      className={
        alleleState === 'carrier'
          ? styles.carrierTag
          : styles.monoallelicAndBiallelicTag
      }
    >
      {capitalize(alleleState)}
    </span>
  );
}
