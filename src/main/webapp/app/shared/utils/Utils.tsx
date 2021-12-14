import {
  Citations,
  TreatmentDrug,
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
  SHORTEN_TEXT_FROM_LIST_THRESHOLD,
  TABLE_COLUMN_KEY,
  LEVEL_TYPES,
  ONCOGENICITY,
  LEVELS,
  LEVEL_PRIORITY,
  FDA_LEVELS,
  ONCOGENIC_MUTATIONS,
  DELETION,
  FUSIONS,
  TRUNCATING_MUTATIONS,
} from 'app/config/constants';
import classnames from 'classnames';
import {
  Alteration,
  EnsemblGene,
  Evidence,
  FdaAlteration,
  TumorType,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  citationsSortMethod,
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
  OncoTreeLink,
  TumorTypePageLink,
} from 'app/shared/utils/UrlUtils';
import moment from 'moment';
import InfoIcon from 'app/shared/icons/InfoIcon';
import WithSeparator from 'react-with-separator';
import { COLOR_BLUE } from 'app/config/theme';
import { Linkout } from 'app/shared/links/Linkout';
import * as styles from 'app/index.module.scss';

// Likely Oncogenic, Predicted Oncogenic will be converted to Oncogenic
// Likely Neutral will be converted to Neutral
export function shortenOncogenicity(oncogenicity: string): string {
  return GENERAL_ONCOGENICITY[oncogenicity];
}

export function getCancerTypeNameFromOncoTreeType(
  oncoTreeType: TumorType
): string {
  return oncoTreeType.subtype || oncoTreeType.mainType || 'NA';
}

export function trimLevelOfEvidenceSubversion(levelOfEvidence: string) {
  return _.replace(levelOfEvidence, new RegExp('[AB]'), '');
}

export function levelOfEvidence2Level(
  levelOfEvidence: string,
  trimSubversion = false
): LEVELS {
  let level = levelOfEvidence.replace('LEVEL_', '');
  if (trimSubversion) {
    level = trimLevelOfEvidenceSubversion(level);
  }
  return level as LEVELS;
}

export function getHighestFdaLevel(fdaAlterations: FdaAlteration[]) {
  let highestFdaLevelIndex = -1;
  fdaAlterations.forEach(alteration => {
    const levelIndex = FDA_LEVELS.indexOf(alteration.level as LEVELS);
    if (
      highestFdaLevelIndex === -1 ||
      (levelIndex !== -1 && levelIndex < highestFdaLevelIndex)
    ) {
      highestFdaLevelIndex = levelIndex;
    }
  });
  return FDA_LEVELS[highestFdaLevelIndex];
}

export function level2LevelOfEvidence(level: LEVELS) {
  switch (level) {
    case LEVELS.Tx3:
    case LEVELS.Tx3A:
      return 'LEVEL_3A';
      break;
    default:
      return `LEVEL_${level}`;
  }
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
  return _.sortBy(evidence.treatments, 'priority')
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
  oncogenicity: string | undefined;
  isVus: boolean;
  className?: string;
}> = props => {
  let oncogenicity = props.oncogenicity;
  if (oncogenicity === undefined) {
    oncogenicity = ONCOGENICITY.UNKNOWN;
  }
  return (
    <span
      style={{ width: 16, marginTop: -3, marginLeft: 3 }}
      key={'oncokb-oncogenicity-icone'}
    >
      <i
        className={classnames(
          `oncokb annotation-icon ${getAnnotationOncogenicityClassName(
            oncogenicity,
            props.isVus
          )} no-level`,
          props.className
        )}
      />
    </span>
  );
};

export const OncoKBLevelIcon: React.FunctionComponent<{
  level: LEVELS;
  withDescription?: boolean;
}> = ({ level, withDescription = true }) => {
  const oncokbIcon = <i className={`oncokb icon level-${level}`} />;
  return withDescription ? (
    <LevelWithDescription level={level}>{oncokbIcon}</LevelWithDescription>
  ) : (
    oncokbIcon
  );
};

export const FdaLevelIcon: React.FunctionComponent<{
  level: LEVELS;
  withDescription?: boolean;
}> = ({ level, withDescription = true }) => {
  const fdaIcon = (
    <span
      className="fa-stack"
      style={{ fontSize: 9, lineHeight: '18px', margin: '0 3px' }}
    >
      <span className="fa fa-circle-thin fa-stack-2x"></span>
      <strong className="fa-stack-1x" style={{ fontSize: '1.2em' }}>
        {level.toString().replace('FDAx', '')}
      </strong>
    </span>
  );

  let levelDescription = '';
  switch (level) {
    case LEVELS.FDAx1:
      levelDescription = 'Companion Diagnostics';
      break;
    case LEVELS.FDAx2:
      levelDescription =
        'Cancer Mutations with Evidence of Clinical Significance';
      break;
    case LEVELS.FDAx3:
      levelDescription =
        'Cancer Mutations with Evidence of Potential Clinical Significance';
      break;
    default:
      break;
  }
  return withDescription ? (
    <LevelWithDescription level={level} description={levelDescription}>
      {fdaIcon}
    </LevelWithDescription>
  ) : (
    fdaIcon
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
              ensemblGenes={props.original.ensemblGenes}
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
    case TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE:
      return {
        id: TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE,
        Header: (
          <span>
            Level-associated cancer types{' '}
            <InfoIcon
              overlay={
                <span>
                  The cancer type is curated using <OncoTreeLink />
                </span>
              }
            />
          </span>
        ),
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
        minWidth: 60,
        width: 60,
        defaultSortDesc: true,
        sortMethod(a: LEVELS, b: LEVELS) {
          return LEVEL_PRIORITY.indexOf(a) - LEVEL_PRIORITY.indexOf(b);
        },
        Cell(props: any) {
          return (
            <div className={'my-1 d-flex justify-content-center'}>
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
        sortMethod: citationsSortMethod,
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

export function getRedirectLoginState(
  pathName: string,
  search: string,
  hash: string
) {
  return {
    from: { pathname: getRouteFromPath(pathName), search, hash },
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

export function encodeResourceUsageDetailPageURL(endpoint: string) {
  return endpoint.split('/').join('!');
}

export function decodeResourceUsageDetailPageURL(url: string) {
  return url.split('!').join('/');
}

export const concatElements = (
  list: ReactNode[],
  separator: string | JSX.Element
) => {
  return list.length === 0 ? (
    <></>
  ) : (
    list.reduce((prev, curr) => [prev, separator, curr])
  );
};

export const concatElementsByComma = (list: ReactNode[]) => {
  return concatElements(list, ', ');
};

export function getShortenTextFromList(data: JSX.Element[] | string[]) {
  if (data.length > SHORTEN_TEXT_FROM_LIST_THRESHOLD) {
    return (
      <span>
        {data[0]} and{' '}
        <DefaultTooltip
          overlay={
            <div style={{ maxWidth: '400px' }}>
              {concatElementsByComma(data)}
            </div>
          }
          overlayStyle={{
            opacity: 1,
          }}
          placement="right"
          destroyTooltipOnHide={true}
        >
          <span
            style={{
              textDecoration: 'underscore',
              color: COLOR_BLUE,
            }}
          >
            {data.length - 1} others
          </span>
        </DefaultTooltip>
      </span>
    );
  } else {
    return concatElementsByComma(data);
  }
}

export function getShortenPmidsFromList(pmidList: string[]) {
  const pmidLinkouts = pmidList.map(pmid => (
    <DefaultTooltip overlay={<CitationTooltip pmids={[pmid]} abstracts={[]} />}>
      <span className={styles.linkOutText}>{pmid}</span>
    </DefaultTooltip>
  ));

  if (pmidList.length > SHORTEN_TEXT_FROM_LIST_THRESHOLD) {
    return (
      <span>
        <span>{pmidLinkouts[0]}</span> and{' '}
        <DefaultTooltip
          overlay={<CitationTooltip pmids={pmidList.slice(1)} abstracts={[]} />}
          overlayStyle={{
            opacity: 1,
          }}
          placement="right"
          destroyTooltipOnHide={true}
        >
          <span
            style={{
              textDecoration: 'underscore',
              color: COLOR_BLUE,
            }}
          >
            {pmidList.length - 1} others
          </span>
        </DefaultTooltip>
      </span>
    );
  } else {
    return concatElementsByComma(pmidLinkouts);
  }
}

export function getGenePageLinks(genes: string): ReactNode {
  return concatElementsByComma(
    genes.split(',').map(gene => <GenePageLink hugoSymbol={gene.trim()} />)
  );
}

export function isPositionalAlteration(
  proteinStart: number,
  proteinEnd: number,
  consequence: string
) {
  if (proteinStart && proteinEnd && consequence) {
    return proteinStart === proteinEnd && consequence === 'NA';
  } else {
    return false;
  }
}

export function getYouTubeLink(type: 'embed' | 'regular', videoId: string) {
  return `https://www.youtube.com/${
    type === 'embed' ? 'embed/' : 'watch?v='
  }${videoId}`;
}

export function getBilibiliLink(videoId: string) {
  return `//player.bilibili.com/player.html?aid=${videoId}`;
}

export interface IAlteration {
  alteration: string;
  name: string;
}

/**
 *
 * @param alteration Alteration, either in string or in IAlteration
 * @param showNameDiff show alteration when name is different. Default: false
 */
export function getAlterationName(
  alteration: IAlteration | string,
  showNameDiff?: boolean
): string {
  const alt: string =
    typeof alteration === 'string' ? alteration : alteration.alteration;
  const name: string =
    typeof alteration === 'string' ? alteration : alteration.name;
  if (
    !showNameDiff ||
    alt === name ||
    name.toLowerCase().startsWith(ONCOGENIC_MUTATIONS.toLowerCase())
  ) {
    return name;
  } else {
    return `${name} (${alt})`;
  }
}

export const getGeneCoordinates = (ensemblGenes: EnsemblGene[]) => {
  return _.sortBy(ensemblGenes, ensemblGene => ensemblGene.referenceGenome)
    .map(
      ensemblGene =>
        `${ensemblGene.referenceGenome}, Chr${ensemblGene.chromosome}:${ensemblGene.start}-${ensemblGene.end}`
    )
    .join('; ');
};

export const getCategoricalAlterationDescription = (
  hugoSymbol: string,
  alteration: string,
  ensemblGenes?: EnsemblGene[]
) => {
  // For places the ensembl genes info is not available, we simply do not show any description for categorical alts
  if (ensemblGenes === undefined || ensemblGenes.length === 0) {
    return '';
  }
  const geneCoordinatesStr =
    ensemblGenes &&
    `the ${hugoSymbol} gene (${getGeneCoordinates(ensemblGenes)})`;
  let content = '';
  switch (alteration) {
    case ONCOGENIC_MUTATIONS:
      content =
        'Defined as a variant considered "oncogenic" or "likely oncogenic" by OncoKB Curation Standard Operating Protocol.';
      break;
    case DELETION:
      content = `Defined as copy number loss resulting in partial or whole deletion of ${geneCoordinatesStr}.`;
      break;
    case FUSIONS:
      content = `Defined as deletion or chromosomal translocation events arising within ${geneCoordinatesStr} that results in a functional fusion event which preserves an intact ${hugoSymbol} kinase domain.`;
      break;
    case TRUNCATING_MUTATIONS:
      content = `Defined as nonsense, frameshift, or splice-site mutations within ${geneCoordinatesStr} that are predicted to shorten the coding sequence of gene.`;
      break;
    default:
      break;
  }

  return content;
};
