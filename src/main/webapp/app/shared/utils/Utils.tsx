import { TumorType } from 'app/shared/api/generated/OncoKbAPI';
import _ from 'lodash';
import React from 'react';
import { ONCOGENICITY_CLASS_NAMES, TABLE_COLUMN_KEY } from 'app/config/constants';
import classnames from 'classnames';
import { Alteration } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import { Column, TableCellRenderer } from 'react-table';

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
        Header: <span>Drug(s)</span>,
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
        style: { justifyContent: 'center', display: 'flex', alignItems: 'center' },
        sortMethod: defaultSortMethod
      };
    case TABLE_COLUMN_KEY.CITATIONS:
      return {
        id: TABLE_COLUMN_KEY.CITATIONS,
        Header: <span>Citation(s)</span>,
        accessor: 'citations',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod
      };
    default:
      undefined;
  }
}

export function filterByKeyword(value: string, keyword: string): boolean {
  return value.toLowerCase().includes(keyword);
}

export function getRenderContentByColumnKey(columnKey: TABLE_COLUMN_KEY, value: string) {
  switch (columnKey) {
    case TABLE_COLUMN_KEY.HUGO_SYMBOL:
      return <GenePageLink hugoSymbol={value} />;
    default:
      return true;
  }
}
