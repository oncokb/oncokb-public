import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { DefaultTooltip, remoteData } from 'cbioportal-frontend-commons';
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
  TumorTypeEntity,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
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
import {
  AlterationPageLink,
  GenePageLink,
  getReferenceGenomeFromSearch,
} from 'app/shared/utils/UrlUtils';
import {
  ANNOTATION_PAGE_TAB_KEYS,
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
import OncoKBTable, {
  ColumnFilters,
  filterByColumnFilters,
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { FilterTypes } from 'app/components/oncokbTable/filters/types';
import { prefetchRelevantCancerTypeNames } from 'app/components/oncokbTable/filters/cancerTypeFilterUtils';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import LevelSelectionRow from './LevelSelectionRow';
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
import InfoIcon from 'app/shared/icons/InfoIcon';
import GeneticTypeTag from 'app/components/tag/GeneticTypeTag';

type Treatment = {
  level: string;
  fdaLevel: string;
  germline: boolean;
  hugoSymbol: string;
  alterations: Alteration[];
  alterationsName: string;
  cancerTypes: TumorTypeEntity[];
  excludedCancerTypes: TumorTypeEntity[];
  relevantCancerTypes: TumorTypeEntity[];
  cancerTypesName: string;
  treatment: EvidenceTreatment | undefined;
  uniqueDrugs: string[];
  drugs: string;
};

type TreatmentRow = Treatment & { isTag?: boolean };

const GENETIC_TYPE_COLUMN_ID = 'geneticType';

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
  @observable.ref columnFilters: ColumnFilters = {};
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

  readonly evidencesByLevel = remoteData<EvidencesByLevel>({
    await: () => [],
    async invoke() {
      return await privateClient.utilsEvidencesByLevelsGetUsingGET({
        germline: false,
      });
    },
    default: {},
  });

  readonly germlineEvidencesByLevel = remoteData<EvidencesByLevel>({
    await: () => [],
    async invoke() {
      return await privateClient.utilsEvidencesByLevelsGetUsingGET({
        germline: true,
      });
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
            this.setColumnFilter(
              TABLE_COLUMN_KEY.HUGO_SYMBOL,
              queryStrings.hugoSymbol
            );
          }
          const cancerType = queryStrings.cancerType || queryStrings.tumorType;
          if (cancerType) {
            const cancerTypes = Array.isArray(cancerType)
              ? cancerType
              : [cancerType];
            this.setColumnFilter(
              TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE,
              cancerTypes
            );
            this.refreshAfterCancerTypeLookup(cancerTypes);
          }
          if (queryStrings.drug) {
            this.setColumnFilter(TABLE_COLUMN_KEY.DRUGS, queryStrings.drug);
          }
          const referenceGenome = getReferenceGenomeFromSearch(hash);
          if (referenceGenome) {
            this.refGenome = referenceGenome;
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
            this.clearColumnFilters([
              TABLE_COLUMN_KEY.DRUGS,
              GENETIC_TYPE_COLUMN_ID,
            ]);
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

  @action
  setColumnFilter(columnId: string, values: string | string[]) {
    const newValues = Array.isArray(values) ? values : [values];
    const currValues = this.columnFilters[columnId] as Set<string> | undefined;
    if (
      currValues &&
      currValues.size === newValues.length &&
      newValues.every(value => currValues.has(value))
    ) {
      return;
    }
    this.columnFilters = {
      ...this.columnFilters,
      [columnId]: new Set(newValues),
    };
  }

  refreshAfterCancerTypeLookup(cancerTypes: string[]) {
    prefetchRelevantCancerTypeNames(cancerTypes).then(
      action(() => {
        this.columnFilters = { ...this.columnFilters };
      })
    );
  }

  getColumnFilterHashValue(columnId: string): string[] | undefined {
    const values = this.columnFilters[columnId] as Set<string> | undefined;
    return values && values.size > 0 ? Array.from(values) : undefined;
  }

  @action
  clearColumnFilters(columnIds: string[]) {
    const newFilters = { ...this.columnFilters };
    columnIds.forEach(columnId => delete newFilters[columnId]);
    this.columnFilters = newFilters;
  }

  @autobind
  @action
  updateColumnFilters(columnFilters: ColumnFilters) {
    const { [TABLE_COLUMN_KEY.LEVEL]: levels, ...otherFilters } = columnFilters;
    const levelSelected = this.initLevelSelected();
    ((levels || new Set()) as Set<LEVELS>).forEach(level => {
      levelSelected[level] = true;
    });
    this.levelSelected = levelSelected;
    this.columnFilters = otherFilters;
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  getTreatments(evidences: Evidence[], germline: boolean) {
    const treatments: (Treatment & { isTag?: boolean })[] = [];
    evidences.forEach((item: Evidence) => {
      const matchedAlterations = item.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(this.refGenome)
      );
      if (matchedAlterations.length > 0 || item.tags.length > 0) {
        const isTag = item.tags.length > 0;
        const level = levelOfEvidence2Level(item.levelOfEvidence, true);
        const fdaLevel = levelOfEvidence2Level(item.fdaLevel, true);

        let sortedAlts: Alteration[] = [];
        if (matchedAlterations.length > 0) {
          sortedAlts = sortByKey(matchedAlterations, 'name');
        } else if (isTag) {
          sortedAlts = item.tags
            .sort((a, b) => a.name.localeCompare(b.name))
            .map<Alteration>(tag => ({
              alteration: tag.name,
              consequence: {
                description: tag.description,
                isGenerallyTruncating: false,
                term: '',
              },
              gene: item.gene,
              name: tag.name,
              proteinChange: '',
              proteinEnd: 0,
              proteinStart: 0,
              refResidues: '',
              referenceGenomes: [],
              variantResidues: '',
            }));
        }
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
              germline,
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
              isTag,
            });
          });
        } else {
          treatments.push({
            level,
            fdaLevel,
            germline,
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
            isTag,
          });
        }
      }
    });
    return treatments;
  }

  getMergedTreatments(evidencesByLevel: EvidencesByLevel, germline: boolean) {
    let treatments: (Treatment & { isTag?: boolean })[] = [];
    Object.keys(evidencesByLevel).forEach(levelOfEvidence => {
      const content = evidencesByLevel[levelOfEvidence];
      treatments = treatments.concat(this.getTreatments(content, germline));
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
    const hugoSymbols = this.getColumnFilterHashValue(
      TABLE_COLUMN_KEY.HUGO_SYMBOL
    );
    if (hugoSymbols) {
      queryString.hugoSymbol = hugoSymbols;
    }
    const cancerTypes = this.getColumnFilterHashValue(
      TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE
    );
    if (cancerTypes) {
      queryString.cancerType = cancerTypes;
    }
    const drugs = this.getColumnFilterHashValue(TABLE_COLUMN_KEY.DRUGS);
    if (drugs) {
      queryString.drug = drugs;
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
  get allOncokbTreatments() {
    const treatments = this.getMergedTreatments(
      this.evidencesByLevel.result,
      false
    ).concat(
      this.getMergedTreatments(this.germlineEvidencesByLevel.result, true)
    );
    return uniqBy(
      treatments,
      treatment =>
        `${treatment.level}-${treatment.germline}-${treatment.hugoSymbol}-${treatment.alterationsName}-${treatment.cancerTypesName}-${treatment.drugs}`
    );
  }

  @computed
  get allFdaTreatments() {
    const treatments: (Treatment & { isTag?: boolean })[] = [];
    this.getMergedTreatments(this.evidencesByLevel.result, false)
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
        `${treatment.level}-${treatment.germline}-${treatment.hugoSymbol}-${treatment.alterationsName}-${treatment.cancerTypesName}`
    );
  }

  @computed
  get tableColumnFilters(): ColumnFilters {
    if (this.selectedLevels.length === 0) {
      return this.columnFilters;
    }
    return {
      ...this.columnFilters,
      [TABLE_COLUMN_KEY.LEVEL]: new Set(this.selectedLevels),
    };
  }

  @computed
  get filteredTreatments(): TreatmentRow[] {
    return filterByColumnFilters(
      this.allTreatments,
      this.columns,
      this.tableColumnFilters
    );
  }

  @computed
  get noFdaLevelSelected() {
    return intersection(this.selectedLevels, FDA_LEVELS).length === 0;
  }

  @computed
  get secondLayerFilterEnabled() {
    return this.columns.some(
      column => (this.columnFilters[column.id!]?.size ?? 0) > 0
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
    this.columnFilters = {};
  }

  @autobind
  downloadAssociation() {
    const header = ['Level', 'Setting', 'Gene', 'Alterations', 'Cancer Types'];
    if (this.drugRelatedLevelSelected) {
      header.push('Drugs (for therapeutic implications only)');
    }
    const content = [header.join('\t')];
    this.filteredTreatments
      .map(treatment => ({
        level: treatment.level,
        setting: treatment.germline ? 'Germline' : 'Somatic',
        hugoSymbol: treatment.hugoSymbol,
        alterations: treatment.alterationsName,
        tumorType: treatment.cancerTypesName,
        drugs: treatment.drugs,
      }))
      .sort((treatmentA, treatmentB) => {
        let result = sortByLevel(treatmentA.level, treatmentB.level);
        if (result === 0) {
          result = treatmentA.setting.localeCompare(treatmentB.setting);
        }
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
          item.setting,
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

  getAlterationCell(
    hugoSymbol: string,
    alterations: Alteration[],
    isTag?: boolean,
    germline = false
  ) {
    const alterationPageHashQueries: AlterationPageHashQueries = {};
    if (this.fdaSectionIsOpen) {
      alterationPageHashQueries.tab = ANNOTATION_PAGE_TAB_KEYS.FDA;
    }
    const linkedAlts = alterations.map<JSX.Element>(
      (alteration, index: number) => {
        if (alteration.consequence && isTag) {
          return (
            <AlterationPageLink
              key={index}
              hugoSymbol={hugoSymbol}
              alteration={alteration.name}
              alterationRefGenomes={
                alteration.referenceGenomes as REFERENCE_GENOME[]
              }
              germline={germline}
              hashQueries={alterationPageHashQueries}
              onClick={() => {
                if (this.fdaSectionIsOpen) {
                  this.props.appStore.toFdaRecognizedContent = true;
                }
              }}
              isTag
            >
              <span>{alteration.name}</span>
              <InfoIcon
                className="ml-2"
                overlay={<span>{alteration.consequence.description}</span>}
              />
            </AlterationPageLink>
          );
        }

        if (alteration.consequence) {
          return (
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
              germline={germline}
              hashQueries={alterationPageHashQueries}
              onClick={() => {
                if (this.fdaSectionIsOpen) {
                  this.props.appStore.toFdaRecognizedContent = true;
                }
              }}
            />
          );
        }

        return <span>{alteration.name}</span>;
      }
    );
    const shortenTextKey = `${hugoSymbol}-${germline}-${alterations
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
  get columns(): SearchColumn<TreatmentRow>[] {
    const commonColumns: SearchColumn<TreatmentRow>[] = [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        Header: <span>Level</span>,
        width: 105,
        minWidth: 105,
        filterType: FilterTypes.LEVEL,
        getColumnFilterValue: (treatment: TreatmentRow) =>
          treatment.level as LEVELS,
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
        id: GENETIC_TYPE_COLUMN_ID,
        Header: <span>Setting</span>,
        accessor: 'germline',
        filterType: FilterTypes.STRING,
        getColumnFilterValue: (treatment: TreatmentRow) =>
          treatment.germline ? 'Germline' : 'Somatic',
        sortMethod(a: boolean, b: boolean) {
          return a === b ? 0 : a ? 1 : -1;
        },
        Cell(props: { original: Treatment }) {
          return (
            <div className={'d-flex'}>
              <GeneticTypeTag isGermline={props.original.germline} />
            </div>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.HUGO_SYMBOL),
        minWidth: 110,
        filterType: FilterTypes.STRING,
        getColumnFilterValue: (treatment: TreatmentRow) => treatment.hugoSymbol,
        style: { whiteSpace: 'normal' },
        Cell: (props: { original: Treatment }) => {
          const hashQueries: GenePageHashQueries = {};
          if (this.fdaSectionIsOpen) {
            hashQueries.tab = ANNOTATION_PAGE_TAB_KEYS.FDA;
          }
          return (
            <GenePageLink
              hugoSymbol={props.original.hugoSymbol}
              germline={props.original.germline}
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
        filterType: FilterTypes.STRING,
        getColumnFilterValue: (treatment: TreatmentRow) =>
          treatment.alterations.map(alteration => alteration.name),
        minWidth: 200,
        style: { whiteSpace: 'normal' },
        defaultSortDesc: false,
        sortMethod(a: Alteration[], b: Alteration[]) {
          return a
            .map(datum => datum.name)
            .join(', ')
            .localeCompare(b.map(datum => datum.name).join(', '));
        },
        Cell: (props: { original: Treatment & { isTag?: boolean } }) => {
          return (
            <div style={{ display: 'block' }}>
              {' '}
              {this.getAlterationCell(
                props.original.hugoSymbol,
                props.original.alterations,
                props.original.isTag,
                props.original.germline
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
        filterType: FilterTypes.CANCER_TYPE,
        getColumnFilterValue: (treatment: TreatmentRow) =>
          treatment.cancerTypes.map(cancerType =>
            getCancerTypeNameFromOncoTreeType(cancerType)
          ),
        getColumnExcludedFilterValue: (treatment: TreatmentRow) =>
          treatment.excludedCancerTypes.map(cancerType =>
            getCancerTypeNameFromOncoTreeType(cancerType)
          ),
      },
    ];
    if (this.drugRelatedLevelSelected) {
      commonColumns.push({
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
        minWidth: 300,
        filterType: FilterTypes.STRING,
        getColumnFilterValue: (treatment: TreatmentRow) =>
          treatment.uniqueDrugs,
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
    const loading = this.fdaSectionIsOpen
      ? this.evidencesByLevel.isPending
      : this.evidencesByLevel.isPending ||
        this.germlineEvidencesByLevel.isPending;
    const tableProps = {
      disableSearch: true,
      data: this.allTreatments,
      columnFilters: this.tableColumnFilters,
      onColumnFiltersChange: this.updateColumnFilters,
      loading,
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

  renderDownloadButton() {
    const canDownload = this.props.authenticationStore
      .isAuthenticatedAndApprovedUser;
    const downloadButton = (
      <AuthDownloadButton
        size={'sm'}
        className={classnames('ml-2')}
        getDownloadData={this.downloadAssociation}
        fileName={'oncokb_biomarker_drug_associations.tsv'}
        buttonText={'Associations'}
        disabled={!canDownload}
        style={canDownload ? undefined : { pointerEvents: 'none' }}
      />
    );

    if (canDownload) {
      return downloadButton;
    }

    // Account not approved yet: disable and explain why. The button is wrapped
    // in a span so the tooltip still fires over the disabled (non-interactive)
    // button. Unauthenticated users are already handled by the paywall.
    return (
      <DefaultTooltip
        overlay={
          'Your account has not been approved yet, so downloading is disabled.'
        }
      >
        <span className={classnames('d-inline-block')}>{downloadButton}</span>
      </DefaultTooltip>
    );
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
        <Row className={'mb-2'}>
          <Col className="d-flex">
            <span>{this.filterResult}</span>
            {this.renderDownloadButton()}
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
