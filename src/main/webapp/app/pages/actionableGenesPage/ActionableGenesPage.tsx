import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import {
  Alteration,
  Evidence,
  TumorType,
  Treatment as EvidenceTreatment,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import Select from 'react-select';
import {
  FdaLevelIcon,
  getCancerTypeNameFromOncoTreeType,
  getCancerTypesNameFromOncoTreeType,
  getDefaultColumnDefinition,
  getDrugNameFromTreatment,
  getPageTitle,
  getTreatmentNameByPriority,
  isFdaLevel,
  levelOfEvidence2Level,
  OncoKBLevelIcon,
} from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import pluralize from 'pluralize';
import { sortByLevel } from 'app/shared/utils/ReactTableUtils';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  COMPONENT_PADDING,
  DEFAULT_REFERENCE_GENOME,
  FDA_LEVELS,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVELS,
  LG_TABLE_FIXED_HEIGHT,
  ONCOKB_LEVELS,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
} from 'app/config/constants';
import { RouterStore } from 'mobx-react-router';
import AuthenticationStore from 'app/store/AuthenticationStore';
import * as QueryString from 'query-string';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import LevelSelectionRow from './LevelSelectionRow';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import {
  ActionableGenesPageHashQueries,
  AlterationPageHashQueries,
  GenePageHashQueries,
} from 'app/shared/route/types';
import AppStore from 'app/store/AppStore';
import ShortenTextWithTooltip from 'app/shared/texts/ShortenTextWithTooltip';
import {
  intersection,
  sortByKey,
  uniq,
  uniqBy,
} from 'app/shared/utils/LodashUtils';
import { Helmet } from 'react-helmet-async';

const queryDelimiter = '|';

type Treatment = {
  level: string;
  fdaLevel: string;
  hugoSymbol: string;
  alterations: Alteration[];
  alterationsName: string;
  cancerTypes: TumorType[];
  excludedCancerTypes: TumorType[];
  relevantCancerTypes: TumorType[];
  cancerTypesName: string;
  treatment: EvidenceTreatment | undefined;
  uniqueDrugs: string[];
  drugs: string;
};

type ActionableGenesPageProps = {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
  appStore: AppStore;
};

type EvidencesByLevel = { [level: string]: Evidence[] };
@inject('routing', 'authenticationStore', 'appStore')
@observer
export default class ActionableGenesPage extends React.Component<
  ActionableGenesPageProps,
  any
> {
  @observable relevantCancerTypeSearchKeywords: string[] = [];
  @observable drugSearchKeywords: string[] = [];
  @observable geneSearchKeywords: string[] = [];
  @observable refGenome = DEFAULT_REFERENCE_GENOME;
  @observable levelSelected: {
    [level in LEVELS]: boolean;
  } = this.initLevelSelected();
  @observable collapseStatus: { [key in LEVEL_TYPES]: boolean } = {
    [LEVEL_TYPES.TX]: true,
    [LEVEL_TYPES.DX]: false,
    [LEVEL_TYPES.PX]: false,
    [LEVEL_TYPES.FDA]: false,
  };
  @observable collapseInit = false;

  readonly allMainTypes = remoteData<string[]>({
    await: () => [],
    async invoke() {
      const result = await privateClient.utilsTumorTypesGetUsingGET({});
      return uniq(
        result
          .filter(cancerType => cancerType.level >= 0)
          .map(cancerType => cancerType.mainType)
      ).sort();
    },
    default: [],
  });

  readonly evidencesByLevel = remoteData<EvidencesByLevel>({
    await: () => [],
    async invoke() {
      return await privateClient.utilsEvidencesByLevelsGetUsingGET({});
    },
    default: {},
  });

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: Readonly<ActionableGenesPageProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING,
          }) as ActionableGenesPageHashQueries;
          if (queryStrings.levels) {
            this.levelSelected = this.initLevelSelected();
            (Array.isArray(queryStrings.levels)
              ? queryStrings.levels
              : [queryStrings.levels]
            ).forEach(level => {
              this.levelSelected[level] = true;
            });
            if (!this.collapseInit) {
              (Array.isArray(queryStrings.levels)
                ? queryStrings.levels
                : [queryStrings.levels]
              ).forEach(level => {
                this.collapseStatus[LEVEL_CLASSIFICATION[level]] = true;
              });
              this.collapseInit = true;
            }
          }
          if (queryStrings.hugoSymbol) {
            this.geneSearchKeywords = queryStrings.hugoSymbol?.split(
              queryDelimiter
            );
          }
          if (queryStrings.tumorType) {
            this.relevantCancerTypeSearchKeywords = queryStrings.tumorType?.split(
              queryDelimiter
            );
          }
          if (queryStrings.cancerType) {
            this.relevantCancerTypeSearchKeywords = queryStrings.cancerType?.split(
              queryDelimiter
            );
          }
          if (queryStrings.drug) {
            this.drugSearchKeywords = queryStrings.drug?.split(queryDelimiter);
          }
          if (queryStrings.refGenome) {
            this.refGenome = queryStrings.refGenome;
          }
          if (queryStrings.sections) {
            const visibleSections = Array.isArray(queryStrings.sections)
              ? queryStrings.sections
              : [queryStrings.sections];
            visibleSections.forEach(
              section => (this.collapseStatus[section] = true)
            );
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.hashQueries,
        newHash => {
          const parsedHashQueryString = QueryString.stringify(newHash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING,
          });
          window.location.hash = parsedHashQueryString;
        },
        true
      ),
      reaction(
        () => this.collapseStatus[LEVEL_TYPES.FDA],
        newStatus => {
          if (newStatus) {
            this.collapseStatus[LEVEL_TYPES.TX] = false;
            this.collapseStatus[LEVEL_TYPES.DX] = false;
            this.collapseStatus[LEVEL_TYPES.PX] = false;
            this.props.appStore.inFdaRecognizedContent = true;
            this.clearSelectedLevels('ONCOKB');
          } else {
            if (
              !(
                this.collapseStatus[LEVEL_TYPES.TX] ||
                this.collapseStatus[LEVEL_TYPES.DX] ||
                this.collapseStatus[LEVEL_TYPES.PX]
              )
            ) {
              this.collapseStatus[LEVEL_TYPES.TX] = true;
              this.clearSelectedLevels('FDA');
            }
          }
        },
        true
      ),
      reaction(
        () =>
          this.collapseStatus[LEVEL_TYPES.TX] ||
          this.collapseStatus[LEVEL_TYPES.DX] ||
          this.collapseStatus[LEVEL_TYPES.PX],
        newStatus => {
          if (newStatus) {
            this.collapseStatus[LEVEL_TYPES.FDA] = false;
            FDA_LEVELS.forEach(fdaLevel => {
              this.levelSelected[fdaLevel] = false;
            });
          }
          if (newStatus && this.props.appStore.inFdaRecognizedContent) {
            this.props.appStore.showFdaModal = true;
            this.props.appStore.inFdaRecognizedContent = false;
          }
        }
      )
    );
  }

  @action
  clearSelectedLevels(type: 'FDA' | 'ONCOKB') {
    (type === 'ONCOKB' ? ONCOKB_LEVELS : FDA_LEVELS).forEach(oncokbLevel => {
      if (this.levelSelected[oncokbLevel]) {
        this.levelSelected[oncokbLevel] = false;
      }
    });
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  getTreatments(evidences: Evidence[]) {
    const treatments: Treatment[] = [];
    evidences.forEach((item: Evidence) => {
      const matchedAlterations = item.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(this.refGenome)
      );
      if (matchedAlterations.length > 0) {
        const level = levelOfEvidence2Level(item.levelOfEvidence, true);
        const fdaLevel = levelOfEvidence2Level(item.fdaLevel, true);
        const sortedAlts = sortByKey(matchedAlterations, 'name');
        const sortedAltsName = sortedAlts
          .map(alteration => alteration.name)
          .sort()
          .join(', ');
        const cancerTypesName = getCancerTypesNameFromOncoTreeType(
          item.cancerTypes,
          item.excludedCancerTypes
        );
        if (item.treatments.length > 0) {
          item.treatments.forEach(treatment => {
            treatments.push({
              level,
              fdaLevel,
              hugoSymbol: item.gene.hugoSymbol || 'NA',
              alterations: sortedAlts,
              alterationsName: sortedAltsName,
              cancerTypes: item.cancerTypes,
              excludedCancerTypes: item.excludedCancerTypes,
              relevantCancerTypes: item.relevantCancerTypes,
              cancerTypesName,
              treatment,
              uniqueDrugs: uniq(
                treatment.drugs.map(drug => getDrugNameFromTreatment(drug))
              ),
              drugs: getTreatmentNameByPriority(treatment),
            });
          });
        } else {
          treatments.push({
            level,
            fdaLevel,
            hugoSymbol: item.gene.hugoSymbol || 'NA',
            alterations: sortedAlts,
            alterationsName: sortedAltsName,
            cancerTypes: item.cancerTypes,
            excludedCancerTypes: item.excludedCancerTypes,
            relevantCancerTypes: item.relevantCancerTypes,
            cancerTypesName,
            treatment: undefined,
            uniqueDrugs: [],
            drugs: '',
          });
        }
      }
    });
    return treatments;
  }

  initLevelSelected(): { [level in LEVELS]: boolean } {
    return Object.values(LEVELS).reduce((acc, level) => {
      acc[level] = false;
      return acc;
    }, {} as { [level in LEVELS]: boolean });
  }

  @computed
  get hashQueries() {
    const queryString: ActionableGenesPageHashQueries = {};
    if (this.selectedLevels.length > 0) {
      queryString.levels = this.selectedLevels;
    }
    if (this.geneSearchKeywords) {
      queryString.hugoSymbol =
        this.geneSearchKeywords.length > 0
          ? this.geneSearchKeywords.join(queryDelimiter)
          : undefined;
    }
    if (this.relevantCancerTypeSearchKeywords) {
      queryString.cancerType =
        this.relevantCancerTypeSearchKeywords.length > 0
          ? this.relevantCancerTypeSearchKeywords.join(queryDelimiter)
          : undefined;
    }
    if (this.drugSearchKeywords) {
      queryString.drug =
        this.drugSearchKeywords.length > 0
          ? this.drugSearchKeywords.join(queryDelimiter)
          : undefined;
    }
    const visibleSections = Object.values(this.collapseStatus).filter(
      sectionStatus => sectionStatus
    );

    if (visibleSections.length > 0) {
      const sections: LEVEL_TYPES[] = [];
      for (const visibleSection in this.collapseStatus) {
        if (this.collapseStatus[visibleSection]) {
          sections.push(visibleSection as LEVEL_TYPES);
        }
      }
      queryString.sections = sections;
    }
    return queryString;
  }

  @computed
  get allTreatments() {
    if (this.fdaSectionIsOpen) {
      return this.allFdaTreatments;
    } else {
      return this.allOncokbTreatments;
    }
  }

  @computed
  get allGenes() {
    return uniq(
      this.allTreatments.map(({ hugoSymbol }) => {
        return {
          value: hugoSymbol,
          label: hugoSymbol,
        };
      })
    ).sort();
  }

  @computed
  get allDrugs() {
    return uniq(
      this.allTreatments.flatMap(({ uniqueDrugs }) => {
        return uniqueDrugs;
      })
    ).sort();
  }

  @computed
  get allOncokbTreatments() {
    let treatments: Treatment[] = [];
    Object.keys(this.evidencesByLevel.result).forEach(levelOfEvidence => {
      const content = this.evidencesByLevel.result[levelOfEvidence];
      treatments = treatments.concat(this.getTreatments(content));
    });
    return uniqBy(
      treatments,
      treatment =>
        `${treatment.level}-${treatment.hugoSymbol}-${treatment.alterationsName}-${treatment.cancerTypesName}-${treatment.drugs}`
    );
  }

  @computed
  get allFdaTreatments() {
    const treatments: Treatment[] = [];
    this.allOncokbTreatments
      .filter(treatment => treatment.fdaLevel)
      .map(treatment => {
        treatments.push({
          ...treatment,
          level: treatment.fdaLevel,
        } as Treatment);
      });
    return uniqBy(
      treatments,
      treatment =>
        `${treatment.level}-${treatment.hugoSymbol}-${treatment.alterationsName}-${treatment.cancerTypesName}`
    );
  }

  @computed
  get filteredTreatments(): Treatment[] {
    return this.allTreatments.filter(treatment => {
      let match = true;
      if (
        this.geneSearchKeywords.length > 0 &&
        !this.geneSearchKeywords.includes(treatment.hugoSymbol)
      ) {
        match = false;
      }
      if (
        this.relevantCancerTypeSearchKeywords.length > 0 &&
        !treatment.relevantCancerTypes.some(rct => {
          if (rct.code) {
            return (
              this.relevantCancerTypeSearchKeywords.includes(rct.code) ||
              this.relevantCancerTypeSearchKeywords.includes(rct.subtype)
            );
          } else {
            return this.relevantCancerTypeSearchKeywords.includes(rct.mainType);
          }
        })
      ) {
        match = false;
      }
      if (
        this.drugSearchKeywords.length > 0 &&
        !treatment.uniqueDrugs.some(x => this.drugSearchKeywords.includes(x))
      ) {
        match = false;
      }
      if (
        this.selectedLevels.length > 0 &&
        !this.selectedLevels.includes(treatment.level)
      ) {
        match = false;
      }
      return match;
    });
  }

  @computed
  get noFdaLevelSelected() {
    return intersection(this.selectedLevels, FDA_LEVELS).length === 0;
  }

  @computed
  get secondLayerFilterEnabled() {
    return (
      this.geneSearchKeywords.length > 0 ||
      this.relevantCancerTypeSearchKeywords.length > 0 ||
      this.drugSearchKeywords.length > 0
    );
  }

  @computed
  get treatmentsAreFiltered() {
    return this.selectedLevels.length > 0 || this.secondLayerFilterEnabled;
  }

  @computed
  get filteredGenes() {
    return uniq(
      this.filteredTreatments.map(treatment => treatment.hugoSymbol)
    ).sort();
  }

  @computed
  get filteredDrugs() {
    return uniq(
      this.filteredTreatments.map(treatment => treatment.uniqueDrugs).flat()
    ).sort();
  }

  @computed
  get filteredTumorTypes() {
    return uniq(
      this.filteredTreatments.map(treatment =>
        treatment.cancerTypes
          .map(ct => getCancerTypeNameFromOncoTreeType(ct))
          .join(', ')
      )
    );
  }

  @computed
  get levelNumbers() {
    const levelNumbers = Object.values(LEVELS).reduce((acc, level) => {
      acc[level] = [];
      return acc;
    }, {} as { [level: string]: string[] });

    // when there is no second layer filtering enabled, we allow to choose multiple levels
    const treatmentSource = this.secondLayerFilterEnabled
      ? this.filteredTreatments
      : this.allTreatments;
    treatmentSource.map(treatment => {
      if (levelNumbers[treatment.level]) {
        levelNumbers[treatment.level].push(treatment.hugoSymbol);
      }
    });
    return Object.keys(levelNumbers).reduce((acc, next) => {
      acc[next] = uniq(levelNumbers[next]).length;
      return acc;
    }, {} as { [level: string]: number });
  }

  @computed
  get filteredLevels() {
    return uniq(this.filteredTreatments.map(treatment => treatment.level));
  }

  @computed
  get data() {
    return null;
  }

  @computed
  get selectedLevels() {
    return Object.keys(this.levelSelected).reduce((acc, level) => {
      if (this.levelSelected[level]) {
        acc.push(level);
      }
      return acc;
    }, [] as string[]);
  }

  @computed
  get drugSelectValue() {
    return this.drugSearchKeywords
      ? this.drugSearchKeywords.map(x => {
          return {
            label: x,
            value: x,
          };
        })
      : null;
  }

  @computed
  get tumorTypeSelectValue() {
    return this.relevantCancerTypeSearchKeywords
      ? this.relevantCancerTypeSearchKeywords.map(x => {
          return {
            label: x,
            value: x,
          };
        })
      : null;
  }

  @computed
  get geneSelectValue() {
    return this.geneSearchKeywords.length > 0
      ? this.geneSearchKeywords.map(x => {
          return {
            label: x,
            value: x,
          };
        })
      : null;
  }

  @autobind
  @action
  updateLevelSelection(levelOfEvidence: LEVELS) {
    this.levelSelected[levelOfEvidence] = !this.levelSelected[levelOfEvidence];
  }

  @autobind
  @action
  updateCollapseStatus(levelType: string) {
    this.collapseStatus[levelType] = !this.collapseStatus[levelType];
  }

  @computed
  get fdaSectionIsOpen() {
    return !!this.collapseStatus[LEVEL_TYPES.FDA];
  }

  @computed
  get oncokbTableKey() {
    return this.fdaSectionIsOpen ? 'paginated' : 'non-paginated';
  }

  @autobind
  @action
  clearFilters() {
    this.levelSelected = this.initLevelSelected();
    this.relevantCancerTypeSearchKeywords = [];
    this.drugSearchKeywords = [];
    this.geneSearchKeywords = [];
  }

  @autobind
  downloadAssociation() {
    const header = ['Level', 'Gene', 'Alterations', 'Cancer Types'];
    if (this.drugRelatedLevelSelected) {
      header.push('Drugs (for therapeutic implications only)');
    }
    const content = [header.join('\t')];
    this.filteredTreatments
      .map(treatment => ({
        level: treatment.level,
        hugoSymbol: treatment.hugoSymbol,
        alterations: treatment.alterationsName,
        tumorType: treatment.cancerTypesName,
        drugs: treatment.drugs,
      }))
      .sort((treatmentA, treatmentB) => {
        let result = sortByLevel(treatmentA.level, treatmentB.level);
        if (result === 0) {
          result = treatmentA.hugoSymbol.localeCompare(treatmentB.hugoSymbol);
        }
        if (result === 0) {
          result = treatmentA.alterations.localeCompare(treatmentB.alterations);
        }
        if (result === 0) {
          result = treatmentA.tumorType.localeCompare(treatmentB.tumorType);
        }
        if (result === 0) {
          result = treatmentA.drugs.localeCompare(treatmentB.drugs);
        }
        return result;
      })
      .forEach(item => {
        const row = [
          item.level,
          item.hugoSymbol,
          item.alterations,
          item.tumorType,
        ];
        if (this.drugRelatedLevelSelected) {
          row.push(item.drugs);
        }
        content.push(row.join('\t'));
      });
    return Promise.resolve(content.join('\n'));
  }

  getAlterationCell(hugoSymbol: string, alterations: Alteration[]) {
    const alterationPageHashQueries: AlterationPageHashQueries = {};
    if (this.fdaSectionIsOpen) {
      alterationPageHashQueries.tab = ANNOTATION_PAGE_TAB_KEYS.FDA;
    }
    const linkedAlts = alterations.map<JSX.Element>(
      (alteration, index: number) =>
        alteration.consequence ? (
          <AlterationPageLink
            key={index}
            hugoSymbol={hugoSymbol}
            alteration={{
              alteration: alteration.alteration,
              name: alteration.name,
            }}
            alterationRefGenomes={
              alteration.referenceGenomes as REFERENCE_GENOME[]
            }
            hashQueries={alterationPageHashQueries}
            onClick={() => {
              if (this.fdaSectionIsOpen) {
                this.props.appStore.toFdaRecognizedContent = true;
              }
            }}
          />
        ) : (
          <span>{alteration.name}</span>
        )
    );
    const shortenTextKey = `${hugoSymbol}-${alterations
      .map(a => a.alteration)
      .join('-')}`;
    return (
      <ShortenTextWithTooltip
        key={shortenTextKey}
        threshold={5}
        data={linkedAlts}
      />
    );
  }

  @computed
  get drugRelatedLevelSelected() {
    if (this.collapseStatus[LEVEL_TYPES.FDA]) {
      return false;
    }
    if (this.selectedLevels.length === 0) {
      return true;
    }
    return (
      intersection(
        [LEVELS.Tx1, LEVELS.Tx2, LEVELS.Tx3, LEVELS.Tx4, LEVELS.R1, LEVELS.R2],
        this.selectedLevels
      ).length > 0
    );
  }

  @computed
  get columns() {
    const commonColumns = [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        Header: <span>Level</span>,
        minWidth: 120,
        Cell(props: any) {
          return (
            <div className={'my-1 d-flex justify-content-center'}>
              {isFdaLevel(props.original.level) ? (
                <FdaLevelIcon
                  level={props.original.level}
                  withDescription={true}
                />
              ) : (
                <OncoKBLevelIcon
                  level={props.original.level}
                  withDescription={true}
                />
              )}
            </div>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.HUGO_SYMBOL),
        style: { whiteSpace: 'normal' },
        Cell: (props: { original: Treatment }) => {
          const hashQueries: GenePageHashQueries = {};
          if (this.fdaSectionIsOpen) {
            hashQueries.tab = ANNOTATION_PAGE_TAB_KEYS.FDA;
          }
          return (
            <GenePageLink
              hugoSymbol={props.original.hugoSymbol}
              hashQueries={hashQueries}
              onClick={() => {
                if (this.fdaSectionIsOpen) {
                  this.props.appStore.toFdaRecognizedContent = true;
                }
              }}
            />
          );
        },
      },
      {
        id: TABLE_COLUMN_KEY.ALTERATIONS,
        Header: <span>Alterations</span>,
        accessor: 'alterations',
        minWidth: 200,
        style: { whiteSpace: 'normal' },
        defaultSortDesc: false,
        sortMethod(a: Alteration[], b: Alteration[]) {
          return a
            .map(datum => datum.name)
            .join(', ')
            .localeCompare(b.map(datum => datum.name).join(', '));
        },
        Cell: (props: { original: Treatment }) => {
          return (
            <div style={{ display: 'block' }}>
              {' '}
              {this.getAlterationCell(
                props.original.hugoSymbol,
                props.original.alterations
              )}
            </div>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE),
        Header: <span>Cancer Types</span>,
        minWidth: 300,
        accessor: 'cancerTypesName',
      },
    ];
    if (this.drugRelatedLevelSelected) {
      commonColumns.push({
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
        minWidth: 300,
        style: { whiteSpace: 'normal' },
        Cell(props: { original: Treatment }) {
          return <span>{props.original.drugs}</span>;
        },
      });
    }
    return commonColumns;
  }

  @computed
  get oncokbTableProps() {
    const tableProps = {
      disableSearch: true,
      data: this.filteredTreatments,
      loading: this.evidencesByLevel.isPending,
      columns: this.columns,
      defaultPageSize: 10,
      defaultSorted: [
        {
          id: TABLE_COLUMN_KEY.LEVEL,
          desc: true,
        },
        {
          id: TABLE_COLUMN_KEY.HUGO_SYMBOL,
          desc: false,
        },
        {
          id: TABLE_COLUMN_KEY.ALTERATIONS,
          desc: false,
        },
        {
          id: TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE,
          desc: false,
        },
        {
          id: TABLE_COLUMN_KEY.DRUGS,
          desc: false,
        },
      ],
      showPagination: this.fdaSectionIsOpen,
      fixedHeight: !this.fdaSectionIsOpen,
      getTdProps: () => ({
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        },
      }),
    };
    if (!this.fdaSectionIsOpen) {
      return {
        ...tableProps,
        minRows: Math.round(LG_TABLE_FIXED_HEIGHT / 36) - 1,
        pageSize:
          this.filteredTreatments.length === 0
            ? 1
            : this.filteredTreatments.length,
        style: {
          height: LG_TABLE_FIXED_HEIGHT,
        },
      };
    } else {
      return tableProps;
    }
  }

  getTable() {
    // We need to render two tables, one with fixed header, one with pagination.
    // Once page size is specified in the fixed header table, it cannot be overwritten by the defaultPageSize
    return <OncoKBTable key={this.oncokbTableKey} {...this.oncokbTableProps} />;
  }

  @computed
  get filterResult() {
    const evidencePostFix = this.fdaSectionIsOpen
      ? `${pluralize('record', this.filteredTreatments.length)}`
      : `clinical  ${pluralize('implication', this.filteredTreatments.length)}`;
    return (
      <>
        <b>{`Showing ${this.filteredTreatments.length} ${evidencePostFix}`}</b>
        {` (${this.filteredGenes.length} ${pluralize(
          'gene',
          this.filteredGenes.length
        )},
                ${this.filteredTumorTypes.length} ${pluralize(
          'cancer type',
          this.filteredTumorTypes.length
        )},
                ${this.filteredLevels.length} ${pluralize(
          'level',
          this.filteredLevels.length
        )} of evidence)`}
      </>
    );
  }

  render() {
    const levelSelectionSection = [];
    for (const key in LEVEL_TYPES) {
      if (LEVEL_TYPES[key]) {
        levelSelectionSection.push(
          <LevelSelectionRow
            key={key}
            levelType={LEVEL_TYPES[key]}
            collapseStatus={this.collapseStatus}
            levelNumbers={this.levelNumbers}
            levelSelected={this.levelSelected}
            updateCollapseStatus={this.updateCollapseStatus}
            updateLevelSelection={this.updateLevelSelection}
            isLoading={this.evidencesByLevel.isPending}
          />
        );
      }
    }

    return (
      <>
        <Helmet>
          <title>{getPageTitle(PAGE_TITLE.ACTIONABLE_GENES)}</title>
          <meta
            name="description"
            content={PAGE_DESCRIPTION.ACTIONABLE_GENES}
          ></meta>
        </Helmet>
        {levelSelectionSection}
        <Row
          style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
          className={'mb-2'}
        >
          <Col
            className={classnames(...COMPONENT_PADDING)}
            lg={this.drugRelatedLevelSelected ? 4 : 6}
            xs={12}
          >
            <Select
              value={this.geneSelectValue}
              placeholder={`${this.filteredGenes.length} actionable ${pluralize(
                'gene',
                this.allGenes.length
              )}`}
              options={this.allGenes}
              isClearable={true}
              onChange={(selectedOption: { value: string; label: string }[]) =>
                (this.geneSearchKeywords = selectedOption
                  ? selectedOption.map(x => x.value)
                  : [])
              }
              isMulti
            />
          </Col>
          <Col
            className={classnames(...COMPONENT_PADDING)}
            lg={this.drugRelatedLevelSelected ? 4 : 6}
            xs={12}
          >
            <CancerTypeSelect
              cancerTypes={this.relevantCancerTypeSearchKeywords}
              onChange={(selectedOption: { value: string; label: string }[]) =>
                (this.relevantCancerTypeSearchKeywords = selectedOption
                  ? selectedOption.map(x => x.label)
                  : [])
              }
              isMulti
            />
          </Col>
          {this.drugRelatedLevelSelected && (
            <Col className={classnames(...COMPONENT_PADDING)} lg={4} xs={12}>
              <Select
                value={this.drugSelectValue}
                placeholder={`${this.allDrugs.length} ${pluralize(
                  'drug',
                  this.filteredDrugs.length
                )}`}
                options={this.allDrugs.map(drug => {
                  return {
                    value: drug,
                    label: drug,
                  };
                })}
                isClearable={true}
                onChange={(
                  selectedOption: { value: string; label: string }[]
                ) =>
                  (this.drugSearchKeywords = selectedOption
                    ? selectedOption.map(x => x.label)
                    : [])
                }
                isMulti
              />
            </Col>
          )}
        </Row>
        <Row className={'mb-2'}>
          <Col className="d-flex">
            <span>{this.filterResult}</span>
            <AuthDownloadButton
              size={'sm'}
              className={classnames('ml-2')}
              getDownloadData={this.downloadAssociation}
              fileName={'oncokb_biomarker_drug_associations.tsv'}
              buttonText={'Associations'}
            />
            {this.treatmentsAreFiltered ? (
              <Button
                variant="link"
                size={'sm'}
                style={{ whiteSpace: 'nowrap' }}
                className={'ml-auto pr-0'}
                onClick={this.clearFilters}
              >
                Reset filters
              </Button>
            ) : undefined}
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>{this.getTable()}</Col>
        </Row>
      </>
    );
  }
}
