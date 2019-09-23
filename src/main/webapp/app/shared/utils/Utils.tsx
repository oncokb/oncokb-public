import { TumorType } from 'app/shared/api/generated/OncoKbAPI';
import _ from 'lodash';
import React from 'react';
import { ONCOGENICITY_CLASS_NAMES } from 'app/config/constants';
import classnames from 'classnames';
import { Alteration } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';

export function getCancerTypeNameFromOncoTreeType(oncoTreeType: TumorType): string {
  return oncoTreeType.name || oncoTreeType.mainType.name || 'NA';
}

export function levelOfEvidence2Level(levelOfEvidence: string) {
  return trimLevelOfEvidenceSubversion(levelOfEvidence).replace('LEVEL_', '');
}

export function trimLevelOfEvidenceSubversion(levelOfEvidence: string) {
  return _.replace(levelOfEvidence, new RegExp('[AB]'), '');
}

export function getAllAlterationsName(alterations: Alteration[]) {
  return alterations ? alterations.map(alteration => alteration.name).join(', ') : '';
}

export function getAllTumorTypesName(tumorTypes: TumorType[]) {
  return tumorTypes
    ? tumorTypes
        .map(getCancerTypeNameFromOncoTreeType)
        .sort()
        .join(', ')
    : '';
}

function getAnnotationLevelClassName(sensitiveLevel: string, resistanceLevel: string) {
  const sensitiveLevelClassName = sensitiveLevel ? `-${sensitiveLevel}` : '';
  const resistanceLevelClassName = resistanceLevel ? `-${resistanceLevel}` : '';

  if (!sensitiveLevelClassName && !resistanceLevelClassName) {
    return 'no-level';
  }
  return `level${sensitiveLevelClassName}${resistanceLevelClassName}`;
}

function getAnnotationOncogenicityClassName(oncogenicity: string, vus: boolean) {
  const map = ONCOGENICITY_CLASS_NAMES[oncogenicity];
  if (map) {
    return map;
  } else {
    if (vus) {
      return 'vus';
    } else {
      return 'unknown';
    }
  }
}

export const OncoKBAnnotationIcon: React.FunctionComponent<{
  oncogenicity: string;
  sensitiveLevel: string;
  resistanceLevel: string;
  vus: boolean;
  className?: string;
}> = props => {
  return (
    <i
      className={classnames(
        `oncokb annotation-icon ${getAnnotationOncogenicityClassName(props.oncogenicity, props.vus)} ${getAnnotationLevelClassName(
          props.sensitiveLevel,
          props.resistanceLevel
        )}`,
        props.className
      )}
    />
  );
};

export const reduceJoin = (data: React.ReactNode[], separator: string) => {
  return data.reduce((prev, curr) => [prev, separator, curr]);
};
