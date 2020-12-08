import {
  Citations,
  Evidence,
  TreatmentDrug,
  TumorType,
  Article,
} from 'app/shared/api/generated/OncoKbAPI';
import _ from 'lodash';
import React, { ReactNode } from 'react';
import {
  APP_LOCAL_DATE_FORMAT,
  APP_LOCAL_DATETIME_FORMAT_Z,
  APP_TIMESTAMP_FORMAT,
  GENERAL_ONCOGENICITY,
  ONCOGENICITY_CLASS_NAMES,
  PAGE_ROUTE,
  TABLE_COLUMN_KEY,
  LEVEL_TYPES,
} from 'app/config/constants';
import classnames from 'classnames';
import {
  Alteration,
  Treatment,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  defaultSortMethod,
  mutationEffectSortMethod,
  oncogenicitySortMethod,
  sortByAlteration,
} from 'app/shared/utils/ReactTableUtils';
import { TableCellRenderer } from 'react-table';
import { LevelWithDescription } from 'app/components/LevelWithDescription';
import pluralize from 'pluralize';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { CitationTooltip } from 'app/components/CitationTooltip';
import {
  AlterationPageLink,
  GenePageLink,
  TumorTypePageLink,
} from 'app/shared/utils/UrlUtils';
import moment from 'moment';

// Likely Oncogenic, Predicted Oncogenic will be converted to Oncogenic
// Likely Neutral will be converted to Neutral
export function shortenOncogenicity(oncogenicity: string): string {
  return GENERAL_ONCOGENICITY[oncogenicity];
}

export function getCancerTypeNameFromOncoTreeType(
  oncoTreeType: TumorType
): string {
  return oncoTreeType.name || oncoTreeType.mainType.name || 'NA';
}

export function trimLevelOfEvidenceSubversion(levelOfEvidence: string) {
  return _.replace(levelOfEvidence, new RegExp('[AB]'), '');
}

export function levelOfEvidence2Level(
  levelOfEvidence: string,
  trimSubversion = false
) {
  let level = levelOfEvidence.replace('LEVEL_', '');
  if (trimSubversion) {
    level = trimLevelOfEvidenceSubversion(level);
  }
  return level;
}

export function level2LevelOfEvidence(level: string) {
  return `LEVEL_${level}`;
}

export function getAllAlterationsName(alterations: Alteration[]) {
  return alterations
    ? alterations.map(alteration => alteration.name).join(', ')
    : '';
}

export function getAllTumorTypesName(tumorTypes: TumorType[]) {
  return tumorTypes
    ? tumorTypes.map(getCancerTypeNameFromOncoTreeType).sort().join(', ')
    : '';
}

export function getDrugNameFromTreatment(drug: TreatmentDrug) {
  // have to use ignore to escape the actual model structure. The swagger does not reflect the actually json structure
  // @ts-ignore
  return drug.drugName;
}

export function getTreatmentNameFromEvidence(evidence: Evidence) {
  return evidence.treatments
    .map(treatment =>
      _.sortBy(treatment.drugs, 'priority')
        .map(drug => getDrugNameFromTreatment(drug))
        .join(' + ')
    )
    .join(', ');
}

export function articles2Citations(articles: Article[]): Citations {
  return {
    abstracts: articles
      .filter(article => !!article.abstract)
      .map(article => {
        return {
          abstract: article.abstract,
          link: article.link,
        };
      }),
    pmids: articles
      .filter(article => !!article.pmid)
      .map(article => article.pmid),
  };
}

export function citationsHasInfo(citations: Citations | null) {
  if (!citations) {
    return false;
  }

  const pmidsSize = citations.pmids ? citations.pmids.length : 0;
  const abstractsSize = citations.abstracts ? citations.abstracts.length : 0;
  return pmidsSize + abstractsSize > 0;
}

function getAnnotationLevelClassName(
  sensitiveLevel: string,
  resistanceLevel: string
) {
  const sensitiveLevelClassName = sensitiveLevel ? `-${sensitiveLevel}` : '';
  const resistanceLevelClassName = resistanceLevel ? `-${resistanceLevel}` : '';

  if (!sensitiveLevelClassName && !resistanceLevelClassName) {
    return 'no-level';
  }
  return `level${sensitiveLevelClassName}${resistanceLevelClassName}`;
}

function getAnnotationOncogenicityClassName(
  oncogenicity: string,
  vus: boolean
) {
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
        `oncokb annotation-icon ${getAnnotationOncogenicityClassName(
          props.oncogenicity,
          props.vus
        )} ${getAnnotationLevelClassName(
          props.sensitiveLevel,
          props.resistanceLevel
        )}`,
        props.className
      )}
    />
  );
};
export const OncoKBOncogenicityIcon: React.FunctionComponent<{
  oncogenicity: string;
  isVus: boolean;
  className?: string;
}> = props => {
  return (
    <span
      style={{ width: 16, marginTop: -3, marginLeft: 3 }}
      key={'oncokb-oncogenicity-icone'}
    >
      <i
        className={classnames(
          `oncokb annotation-icon ${getAnnotationOncogenicityClassName(
            props.oncogenicity,
            props.isVus
          )} no-level`,
          props.className
        )}
      />
    </span>
  );
};

export const OncoKBLevelIcon: React.FunctionComponent<{
  level: string;
  withDescription?: boolean;
}> = ({ level, withDescription = true }) => {
  const oncokbIcon = <i className={`oncokb level-icon level-${level}`} />;
  return withDescription ? (
    <LevelWithDescription level={level}>{oncokbIcon}</LevelWithDescription>
  ) : (
    oncokbIcon
  );
};

export function getDefaultColumnDefinition<T>(
  columnKey: TABLE_COLUMN_KEY
):
  | {
      id: string;
      Header: TableCellRenderer;
      accessor: string;
      minWidth: number;
      width?: number;
      style?: object;
      defaultSortDesc: boolean;
      Cell?: TableCellRenderer;
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
        sortMethod: defaultSortMethod,
        Cell(props: { original: any }) {
          return <GenePageLink hugoSymbol={props.original.hugoSymbol} />;
        },
      };
    case TABLE_COLUMN_KEY.ALTERATION:
      return {
        id: TABLE_COLUMN_KEY.ALTERATION,
        Header: <span>Alteration</span>,
        accessor: 'alteration',
        minWidth: 100,
        defaultSortDesc: true,
        sortMethod: sortByAlteration,
        Cell(props: { original: any }) {
          return (
            <AlterationPageLink
              hugoSymbol={props.original.hugoSymbol}
              alteration={props.original.alteration}
            />
          );
        },
      };
    case TABLE_COLUMN_KEY.ALTERATIONS:
      return {
        id: TABLE_COLUMN_KEY.ALTERATION,
        Header: <span>Alterations</span>,
        accessor: 'alterations',
        style: { whiteSpace: 'normal' },
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod,
      };
    case TABLE_COLUMN_KEY.TUMOR_TYPE:
      return {
        id: TABLE_COLUMN_KEY.TUMOR_TYPE,
        Header: <span>Tumor Type</span>,
        accessor: 'cancerType',
        style: { whiteSpace: 'normal' },
        minWidth: 150,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod,
        Cell(props: { original: any }) {
          return (
            <TumorTypePageLink
              hugoSymbol={props.original.hugoSymbol}
              alteration={props.original.alteration}
              tumorType={props.original.tumorType}
            />
          );
        },
      };
    case TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE:
      return {
        id: TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE,
        Header: <span>Level-associated cancer types</span>,
        accessor: 'cancerTypes',
        style: { whiteSpace: 'normal' },
        minWidth: 110,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod,
      };
    case TABLE_COLUMN_KEY.DRUGS:
      return {
        id: TABLE_COLUMN_KEY.DRUGS,
        Header: <span>Drugs</span>,
        accessor: 'drugs',
        style: { whiteSpace: 'normal' },
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod,
      };
    case TABLE_COLUMN_KEY.LEVEL:
      return {
        id: TABLE_COLUMN_KEY.LEVEL,
        Header: <span>Level</span>,
        accessor: 'level',
        minWidth: 70,
        width: 70,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod,
        Cell(props: any) {
          return (
            <div className={'my-1'}>
              <OncoKBLevelIcon
                level={props.original.level}
                withDescription={true}
              />
            </div>
          );
        },
      };
    case TABLE_COLUMN_KEY.CITATIONS:
      return {
        id: TABLE_COLUMN_KEY.CITATIONS,
        Header: <span>Citations</span>,
        accessor: 'citations',
        minWidth: 90,
        defaultSortDesc: false,
        sortMethod: defaultSortMethod,
        Cell(props: any) {
          const numOfReferences =
            props.original.drugAbstracts.length +
            props.original.drugPmids.length;
          return (
            <div>
              <DefaultTooltip
                placement="left"
                trigger={['hover', 'focus']}
                overlay={() => (
                  <CitationTooltip
                    pmids={props.original.drugPmids}
                    abstracts={props.original.drugAbstracts}
                  />
                )}
              >
                <span>{numOfReferences}</span>
              </DefaultTooltip>
            </div>
          );
        },
      };
    case TABLE_COLUMN_KEY.ONCOGENICITY:
      return {
        id: TABLE_COLUMN_KEY.ONCOGENICITY,
        Header: <span>Oncogenic</span>,
        accessor: 'oncogenic',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: oncogenicitySortMethod,
      };
    case TABLE_COLUMN_KEY.MUTATION_EFFECT:
      return {
        id: TABLE_COLUMN_KEY.MUTATION_EFFECT,
        Header: <span>Mutation Effect</span>,
        accessor: 'mutationEffect',
        minWidth: 100,
        defaultSortDesc: false,
        sortMethod: mutationEffectSortMethod,
      };
    default:
      return undefined;
  }
}

export function filterByKeyword(
  value: string | undefined | null,
  keyword: string
): boolean {
  return value ? value.toLowerCase().includes(keyword) : false;
}

export function getRouteFromPath(pathName: string) {
  const firstSplashIndex = pathName.indexOf('/');
  return firstSplashIndex === -1
    ? PAGE_ROUTE.HOME
    : pathName.substr(pathName.indexOf('/') + 1);
}

export function getRedirectLoginState(pathName: string) {
  return {
    from: getRouteFromPath(pathName),
  };
}

export function toAppTimestampFormat(utcTime: string | undefined) {
  if (!utcTime) return '';
  return moment(utcTime, APP_LOCAL_DATETIME_FORMAT_Z).format(
    APP_TIMESTAMP_FORMAT
  );
}

export function toAppLocalDateFormat(utcTime: string | undefined) {
  if (!utcTime) return '';
  return moment(utcTime, APP_LOCAL_DATETIME_FORMAT_Z).format(
    APP_LOCAL_DATE_FORMAT
  );
}

export function getMomentInstance(utcTime: string) {
  return moment(utcTime, APP_LOCAL_DATETIME_FORMAT_Z);
}

export function daysDiff(date: string) {
  const today = moment.utc();
  const expiration = getMomentInstance(date);
  return expiration.diff(today, 'days');
}

export function secDiff(date: string) {
  const today = moment.utc();
  const expiration = getMomentInstance(date);
  return expiration.diff(today, 'hours');
}

const SLASH_HTML_ENTITY_CODE = '%2F';

export function encodeSlash(content: string | undefined) {
  return content ? content.replace('/', SLASH_HTML_ENTITY_CODE) : content;
}

export function decodeSlash(content: string | undefined) {
  return content ? content.replace(SLASH_HTML_ENTITY_CODE, '/') : content;
}

export const scrollWidthOffsetInNews = (el?: any) => {
  const yCoordinate =
    el === undefined ? 0 : el.getBoundingClientRect().top + window.pageYOffset;
  const yOffset = -80;
  window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' });
};
