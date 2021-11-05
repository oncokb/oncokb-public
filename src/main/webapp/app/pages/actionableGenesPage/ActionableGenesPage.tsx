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
  FdaAlteration,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import Select from 'react-select';
import _ from 'lodash';
import {
  FdaLevelIcon,
  getCancerTypeNameFromOncoTreeType,
  getDefaultColumnDefinition,
  getDrugNameFromTreatment,
  getTreatmentNameFromEvidence,
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
  DOCUMENT_TITLES,
  FDA_LEVELS,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVELS,
  LG_TABLE_FIXED_HEIGHT,
  ONCOKB_LEVELS,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
} from 'app/config/constants';
import { RouterStore } from 'mobx-react-router';
import AuthenticationStore from 'app/store/AuthenticationStore';
import * as QueryString from 'query-string';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import DocumentTitle from 'react-document-title';
import { COLOR_BLUE } from 'app/config/theme';
import WithSeparator from 'react-with-separator';
import LevelSelectionRow from './LevelSelectionRow';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import {
  ActionableGenesPageHashQueries,
  AlterationPageHashQueries,
  GenePageHashQueries,
} from 'app/shared/route/types';
import AppStore from 'app/store/AppStore';
import { If, Else, Then } from 'react-if';
import ShortenTextWithTooltip from 'app/shared/texts/ShortenTextWithTooltip';

type Treatment = {
  level: string;
  hugoSymbol: string;
  alterations: Alteration[];
  cancerTypes: string[];
  treatments: {}[];
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
  @observable relevantTumorTypeSearchKeyword = '';
  @observable drugSearchKeyword = '';
  @observable geneSearchKeyword = '';
  @observable refGenome = DEFAULT_REFERENCE_GENOME;
  @observable levelSelected: {
    [level in keyof LEVELS]: boolean;
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
      return _.chain(result)
        .filter(cancerType => cancerType.level >= 0)
        .map(cancerType => cancerType.mainType)
        .uniq()
        .value()
        .sort();
    },
    default: [],
  });

  readonly allTumorTypes = remoteData<string[]>({
    await: () => [this.allMainTypes, this.evidencesByLevel],
    invoke: async () => {
      let allTumorTypes: string[] = _.uniq(
        this.allMainTypes.result
          .filter(mainType => !mainType.endsWith('NOS'))
          .map(mainType => mainType)
      );

      this.allTreatments.forEach(treatment => {
        allTumorTypes = allTumorTypes.concat(treatment.cancerTypes);
      });

      return Promise.resolve(_.uniq(allTumorTypes));
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

  readonly allFdaAlterations = remoteData<FdaAlteration[]>({
    await: () => [],
    async invoke() {
      return await privateClient.utilsFdaAlterationsGetUsingGET({});
    },
    default: [],
  });

  readonly relevantTumorTypes = remoteData<string[]>({
    await: () => [this.allTumorTypes],
    invoke: async () => {
      let result = [];
      if (this.relevantTumorTypeSearchKeyword) {
        const allRelevantTumorTypes = await privateClient.utilRelevantTumorTypesGetUsingGET(
          {
            tumorType: this.relevantTumorTypeSearchKeyword,
          }
        );
        result = allRelevantTumorTypes.map(tumorType => {
          return tumorType.code ? tumorType.subtype : tumorType.mainType;
        });
      } else {
        result = this.allTumorTypes.result;
      }
      return result.sort();
    },
    default: [],
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
            (_.isArray(queryStrings.levels)
              ? queryStrings.levels
              : [queryStrings.levels]
            ).forEach(level => {
              this.levelSelected[level] = true;
            });
            if (!this.collapseInit) {
              (_.isArray(queryStrings.levels)
                ? queryStrings.levels
                : [queryStrings.levels]
              ).forEach(level => {
                this.collapseStatus[LEVEL_CLASSIFICATION[level]] = true;
              });
              this.collapseInit = true;
            }
          }
          if (queryStrings.hugoSymbol) {
            this.geneSearchKeyword = queryStrings.hugoSymbol;
          }
          if (queryStrings.tumorType) {
            this.relevantTumorTypeSearchKeyword = queryStrings.tumorType;
          }
          if (queryStrings.drug) {
            this.drugSearchKeyword = queryStrings.drug;
          }
          if (queryStrings.refGenome) {
            this.refGenome = queryStrings.refGenome;
          }
          if (queryStrings.sections) {
            const visibleSections = _.isArray(queryStrings.sections)
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
    _.forEach(evidences, (item: Evidence) => {
      const matchedAlterations = item.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(this.refGenome)
      );
      if (matchedAlterations.length > 0) {
        treatments.push({
          level: levelOfEvidence2Level(item.levelOfEvidence, true),
          hugoSymbol: item.gene.hugoSymbol || 'NA',
          alterations: _.sortBy(matchedAlterations, 'name'),
          cancerTypes: item.cancerTypes.map(cancerType =>
            getCancerTypeNameFromOncoTreeType(cancerType)
          ),
          treatments: item.treatments,
          uniqueDrugs: _.uniq(
            _.reduce(
              item.treatments,
              (acc, treatment) => {
                const result: string[] = treatment.drugs.map(drug =>
                  getDrugNameFromTreatment(drug)
                );
                return acc.concat(result);
              },
              [] as string[]
            )
          ),
          drugs: getTreatmentNameFromEvidence(item),
        });
      }
    });
    return treatments;
  }

  initLevelSelected(): { [level in keyof LEVELS]: boolean } {
    return _.reduce(
      LEVELS,
      (acc, level) => {
        acc[level] = false;
        return acc;
      },
      {} as { [level in keyof LEVELS]: boolean }
    );
  }

  @computed
  get hashQueries() {
    const queryString: ActionableGenesPageHashQueries = {};
    if (this.selectedLevels.length > 0) {
      queryString.levels = this.selectedLevels;
    }
    if (this.geneSearchKeyword) {
      queryString.hugoSymbol = this.geneSearchKeyword;
    }
    if (this.relevantTumorTypeSearchKeyword) {
      queryString.tumorType = this.relevantTumorTypeSearchKeyword;
    }
    if (this.drugSearchKeyword) {
      queryString.drug = this.drugSearchKeyword;
    }
    const visibleSections = _.chain(this.collapseStatus)
      .values()
      .filter(sectionStatus => sectionStatus)
      .value();
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
    let treatments: Treatment[] = [];
    _.forEach(this.evidencesByLevel.result, (content, levelOfEvidence) => {
      treatments = treatments.concat(this.getTreatments(content));
    });
    return treatments;
  }

  @computed
  get allFdaTreatments() {
    const treatments: Treatment[] = [];
    this.allFdaAlterations.result.forEach(fdaAlt => {
      if (!fdaAlt.cancerType.endsWith('NOS')) {
        treatments.push({
          level: fdaAlt.level,
          hugoSymbol: fdaAlt.alteration.gene.hugoSymbol,
          alterations: [fdaAlt.alteration],
          cancerTypes: [fdaAlt.cancerType],
        } as Treatment);
      }
    });
    return treatments;
  }

  @computed
  get filteredTreatments(): Treatment[] {
    return this.allTreatments.filter(treatment => {
      let match = true;
      if (
        this.geneSearchKeyword &&
        treatment.hugoSymbol !== this.geneSearchKeyword
      ) {
        match = false;
      }
      if (
        this.relevantTumorTypeSearchKeyword &&
        this.relevantTumorTypes.result.filter(tumorType =>
          treatment.cancerTypes.includes(tumorType)
        ).length === 0
      ) {
        match = false;
      }
      if (
        this.drugSearchKeyword &&
        !treatment.uniqueDrugs.includes(this.drugSearchKeyword)
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
    return _.intersection(this.selectedLevels, FDA_LEVELS).length === 0;
  }

  @computed
  get secondLayerFilterEnabled() {
    return (
      !!this.geneSearchKeyword ||
      !!this.relevantTumorTypeSearchKeyword ||
      !!this.drugSearchKeyword
    );
  }

  @computed
  get treatmentsAreFiltered() {
    return this.selectedLevels.length > 0 || this.secondLayerFilterEnabled;
  }

  @computed
  get filteredGenes() {
    return _.uniq(
      this.filteredTreatments.map(treatment => treatment.hugoSymbol)
    ).sort();
  }

  @computed
  get filteredDrugs() {
    return _.uniq(
      _.flatten(this.filteredTreatments.map(treatment => treatment.uniqueDrugs))
    ).sort();
  }

  @computed
  get filteredTumorTypes() {
    return _.uniq(
      this.filteredTreatments.map(treatment => treatment.cancerTypes.join(', '))
    );
  }

  @computed
  get levelNumbers() {
    const levelNumbers = _.reduce(
      LEVELS,
      (acc, level) => {
        acc[level] = [];
        return acc;
      },
      {} as { [level: string]: string[] }
    );

    // when there is no second layer filtering enabled, we allow to choose multiple levels
    const treatmentSource = this.secondLayerFilterEnabled
      ? this.filteredTreatments
      : this.allTreatments;
    treatmentSource.map(treatment => {
      if (levelNumbers[treatment.level]) {
        levelNumbers[treatment.level].push(treatment.hugoSymbol);
      }
    });
    return _.reduce(
      levelNumbers,
      (acc, next, level) => {
        acc[level] = _.uniq(next).length;
        return acc;
      },
      {} as { [level: string]: number }
    );
  }

  @computed
  get filteredLevels() {
    return _.uniq(this.filteredTreatments.map(treatment => treatment.level));
  }

  @computed
  get data() {
    return null;
  }

  @computed
  get selectedLevels() {
    return _.reduce(
      this.levelSelected,
      (acc, selected, level) => {
        if (selected) {
          acc.push(level);
        }
        return acc;
      },
      [] as string[]
    );
  }

  @computed
  get drugSelectValue() {
    return this.drugSearchKeyword
      ? {
          label: this.drugSearchKeyword,
          value: this.drugSearchKeyword,
        }
      : null;
  }

  @computed
  get tumorTypeSelectValue() {
    return this.relevantTumorTypeSearchKeyword
      ? {
          label: this.relevantTumorTypeSearchKeyword,
          value: this.relevantTumorTypeSearchKeyword,
        }
      : null;
  }

  @computed
  get geneSelectValue() {
    return this.geneSearchKeyword
      ? {
          label: this.geneSearchKeyword,
          value: this.geneSearchKeyword,
        }
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

  @autobind
  @action
  clearFilters() {
    this.levelSelected = this.initLevelSelected();
    this.relevantTumorTypeSearchKeyword = '';
    this.drugSearchKeyword = '';
    this.geneSearchKeyword = '';
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
        alterations: treatment.alterations
          .map(alteration => alteration.name)
          .sort()
          .join(', '),
        tumorType: treatment.cancerTypes.join(', '),
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
      (alteration, index: number) => (
        <>
          <AlterationPageLink
            key={index}
            hugoSymbol={hugoSymbol}
            alteration={alteration.name}
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
        </>
      )
    );
    return <ShortenTextWithTooltip threshold={5} data={linkedAlts} />;
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
      _.intersection(
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
              {_.startsWith(props.original.level, 'FDA') ? (
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
        accessor: 'cancerTypes',
        sortMethod(a: string[], b: string[]) {
          return a.join(', ').localeCompare(b.join(', '));
        },
        Cell(props: { original: Treatment }) {
          return <span>{props.original.cancerTypes.join(', ')}</span>;
        },
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
      loading:
        this.relevantTumorTypes.isPending &&
        (this.fdaSectionIsOpen
          ? this.allFdaAlterations.isPending
          : this.evidencesByLevel.isPending),
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
    return (
      <If condition={this.fdaSectionIsOpen}>
        <Then>
          <OncoKBTable {...this.oncokbTableProps} />
        </Then>
        <Else>
          <OncoKBTable {...this.oncokbTableProps} />
        </Else>
      </If>
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
            levelType={LEVEL_TYPES[key]}
            collapseStatus={this.collapseStatus}
            levelNumbers={this.levelNumbers}
            levelSelected={this.levelSelected}
            updateCollapseStatus={this.updateCollapseStatus}
            updateLevelSelection={this.updateLevelSelection}
            isLoading={
              this.fdaSectionIsOpen
                ? this.allFdaAlterations.isPending
                : this.evidencesByLevel.isPending
            }
          />
        );
      }
    }

    return (
      <DocumentTitle title={DOCUMENT_TITLES.ACTIONABLE_GENES}>
        <>
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
                placeholder={`${
                  this.filteredGenes.length
                } actionable ${pluralize('gene', this.filteredGenes.length)}`}
                options={this.filteredGenes.map(hugoSymbol => {
                  return {
                    value: hugoSymbol,
                    label: hugoSymbol,
                  };
                })}
                isClearable={true}
                onChange={(selectedOption: any) =>
                  (this.geneSearchKeyword = selectedOption
                    ? selectedOption.label
                    : '')
                }
              />
            </Col>
            <Col
              className={classnames(...COMPONENT_PADDING)}
              lg={this.drugRelatedLevelSelected ? 4 : 6}
              xs={12}
            >
              <CancerTypeSelect
                tumorType={this.relevantTumorTypeSearchKeyword}
                onChange={(selectedOption: any) =>
                  (this.relevantTumorTypeSearchKeyword = selectedOption
                    ? selectedOption.value
                    : '')
                }
              />
            </Col>
            {this.drugRelatedLevelSelected && (
              <Col className={classnames(...COMPONENT_PADDING)} lg={4} xs={12}>
                <Select
                  value={this.drugSelectValue}
                  placeholder={`${this.filteredDrugs.length} ${pluralize(
                    'drug',
                    this.filteredDrugs.length
                  )}`}
                  options={this.filteredDrugs.map(drug => {
                    return {
                      value: drug,
                      label: drug,
                    };
                  })}
                  isClearable={true}
                  onChange={(selectedOption: any) =>
                    (this.drugSearchKeyword = selectedOption
                      ? selectedOption.label
                      : '')
                  }
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
      </DocumentTitle>
    );
  }
}
