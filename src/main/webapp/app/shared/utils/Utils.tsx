import { TumorType } from 'app/shared/api/generated/OncoKbAPI';
import _ from 'lodash';
import React from 'react';
import { ONCOGENICITY_CLASS_NAMES, TABLE_COLUMN_KEY } from 'app/config/constants';
import classnames from 'classnames';
import { Alteration } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { defaultSortMethod, mutationEffectSortMethod, oncogenicitySortMethod } from 'app/shared/utils/ReactTableUtils';
import { TableCellRenderer } from 'react-table';
import { LevelWithDescription } from 'app/components/LevelWithDescription';

export function getCancerTypeNameFromOncoTreeType(oncoTreeType: TumorType): string {
  return oncoTreeType.name || oncoTreeType.mainType.name || 'NA';
}

export function levelOfEvidence2Level(levelOfEvidence: string) {
  return trimLevelOfEvidenceSubversion(levelOfEvidence).replace('LEVEL_', '');
}

export function level2LevelOfEvidence(level: string) {
  return `LEVEL_${level}`;
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

export const reduceJoin = (data: React.ReactNode[], separator: string | JSX.Element) => {
  return data.reduce((prev, curr) => [prev, separator, curr]);
};

export const OncoKBLevelIcon: React.FunctionComponent<{
  level: string;
  withDescription?: boolean;
}> = ({ level, withDescription = true }) => {
  const oncokbIcon = <i className={`oncokb level-icon level-${level}`} />;
  return withDescription ? <LevelWithDescription level={level}>{oncokbIcon}</LevelWithDescription> : oncokbIcon;
};

export function getDefaultColumnDefinition<T>(
  columnKey: TABLE_COLUMN_KEY
):
  | {
      id: string;
      Header: TableCellRenderer;
      accessor: string;
      minWidth: number;
      style?: object;
      defaultSortDesc: boolean;
      sortMethod: typeof defaultSortMethod;
    }
  | undefined {
  switch (columnKey) {
    case TABLE_COLUMN_KEY.HUGO_SYMBOL:
      return {
        id: TABLE_COLUMN_KEY.HUGO_SYMBOL,
        Header: <span>Gene</span>,
        accessor: 'hugoSymbol',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.ALTERATION:
      return {
        id: TABLE_COLUMN_KEY.ALTERATION,
        Header: <span>Alteration</span>,
        accessor: 'alteration',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.TUMOR_TYPE:
      return {
        id: TABLE_COLUMN_KEY.TUMOR_TYPE,
        Header: <span>Tumor Type</span>,
        accessor: 'cancerType',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.DRUGS:
      return {
        id: TABLE_COLUMN_KEY.DRUGS,
        Header: <span>Drug</span>,
        accessor: 'drugs',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.LEVEL:
      return {
        id: TABLE_COLUMN_KEY.LEVEL,
        Header: <span>Level</span>,
        accessor: 'level',
        minWidth: 100,
        defaultSortDesc: false,
        style: getCenterAlignStyle(),
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.CITATIONS:
      return {
        id: TABLE_COLUMN_KEY.CITATIONS,
        Header: <span>Citation</span>,
        accessor: 'citations',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.CITATIONS:
      return {
        id: TABLE_COLUMN_KEY.CITATIONS,
        Header: <span>Citation</span>,
        accessor: 'citations',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.ONCOGENICITY:
      return {
        id: TABLE_COLUMN_KEY.ONCOGENICITY,
        Header: <span>Oncogenic</span>,
        accessor: 'oncogenic',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: oncogenicitySortMethod
      };
    case TABLE_COLUMN_KEY.MUTATION_EFFECT:
      return {
        id: TABLE_COLUMN_KEY.MUTATION_EFFECT,
        Header: <span>Mutation Effect</span>,
        accessor: 'mutationEffect',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: mutationEffectSortMethod
      };
    default:
      return undefined;
  }
}

export function getCenterAlignStyle() {
  return { justifyContent: 'center', display: 'flex', alignItems: 'center' };
}
export function filterByKeyword(value: string, keyword: string): boolean {
  return value.toLowerCase().includes(keyword);
}
