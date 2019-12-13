import React from 'react';
import { inject, observer } from 'mobx-react';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { Button, Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction
} from 'mobx';
import { Evidence, MainType } from 'app/shared/api/generated/OncoKbPrivateAPI';
import Select from 'react-select';
import _ from 'lodash';
import {
  getCancerTypeNameFromOncoTreeType,
  getDefaultColumnDefinition,
  getDrugNameFromTreatment,
  getTreatmentNameFromEvidence,
  levelOfEvidence2Level
} from 'app/shared/utils/Utils';
import autobind from 'autobind-decorator';
import pluralize from 'pluralize';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import { Else, If, Then } from 'react-if';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import {
  LEVEL_BUTTON_DESCRIPTION,
  LEVELS,
  LG_TABLE_FIXED_HEIGHT,
  TABLE_COLUMN_KEY,
  COMPONENT_PADDING,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  DOCUMENT_TITLES
} from 'app/config/constants';
import { RouterStore } from 'mobx-react-router';
import AuthenticationStore from 'app/store/AuthenticationStore';
import * as QueryString from 'query-string';
import OncoKBTable from 'app/components/oncokbTable/OncoKBTable';
import { AuthDownloadButton } from 'app/components/authDownloadButton/AuthDownloadButton';
import DocumentTitle from 'react-document-title';

type Treatment = {
  level: string;
  hugoSymbol: string;
  alterations: string[];
  tumorType: string;
  treatments: {}[];
  uniqueDrugs: string[];
  drugs: string;
};

type ActionableGenesPageProps = {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
};

type HashQueries = {
  levels?: string[];
  hugoSymbol?: string;
  tumorType?: string;
  drug?: string;
};

type EvidencesByLevel = { [level: string]: Evidence[] };
@inject('routing', 'authenticationStore')
@observer
export default class ActionableGenesPage extends React.Component<
  ActionableGenesPageProps
> {
  @observable relevantTumorTypeSearchKeyword = '';
  @observable drugSearchKeyword = '';
  @observable geneSearchKeyword = '';
  @observable levelSelected = this.initLevelSelected();

  readonly allMainTypes = remoteData<MainType[]>({
    await: () => [],
    async invoke() {
      const result = await privateClient.utilsOncoTreeMainTypesGetUsingGET({});
      return result.sort();
    },
    default: []
  });

  readonly allTumorTypes = remoteData<string[]>({
    await: () => [this.allMainTypes, this.evidencesByLevel],
    invoke: async () => {
      let allTumorTypes: string[] = _.uniq(
        this.allMainTypes.result
          .filter(mainType => !mainType.name.endsWith('NOS'))
          .map(mainType => mainType.name)
      );

      allTumorTypes = allTumorTypes.concat(
        this.allTreatments.map(treatment => treatment.tumorType)
      );

      return Promise.resolve(_.uniq(allTumorTypes));
    },
    default: []
  });

  readonly evidencesByLevel = remoteData<EvidencesByLevel>({
    await: () => [],
    async invoke() {
      return await privateClient.utilsEvidencesByLevelsGetUsingGET({});
    },
    default: {}
  });

  readonly relevantTumorTypes = remoteData<string[]>({
    await: () => [this.allTumorTypes],
    invoke: async () => {
      let result = [];
      if (this.relevantTumorTypeSearchKeyword) {
        const allRelevantTumorTypes = await privateClient.utilRelevantTumorTypesGetUsingGET(
          {
            tumorType: this.relevantTumorTypeSearchKeyword
          }
        );
        result = allRelevantTumorTypes.map(tumorType => {
          return tumorType.code ? tumorType.name : tumorType.mainType.name;
        });
      } else {
        result = this.allTumorTypes.result;
      }
      return result.sort();
    },
    default: []
  });

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: Readonly<ActionableGenesPageProps>) {
    super(props);
    this.reactions.push(
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING
          }) as HashQueries;
          if (queryStrings.levels) {
            this.levelSelected = this.initLevelSelected();
            (_.isArray(queryStrings.levels)
              ? queryStrings.levels
              : [queryStrings.levels]
            ).forEach(level => (this.levelSelected[level] = true));
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
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.hashQueries,
        newHash => {
          const parsedHashQueryString = QueryString.stringify(newHash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING
          });
          window.location.hash = parsedHashQueryString;
        }
      )
    );
  }

  componentWillUnmount(): void {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  getTreatments(evidences: Evidence[]) {
    const treatments: Treatment[] = [];
    _.forEach(evidences, (item: Evidence) => {
      treatments.push({
        level: levelOfEvidence2Level(item.levelOfEvidence, true),
        hugoSymbol: item.gene.hugoSymbol || 'NA',
        alterations: item.alterations
          .map(function(alt) {
            return alt.name ? alt.name : alt.alteration;
          })
          .sort(),
        tumorType: getCancerTypeNameFromOncoTreeType(item.oncoTreeType),
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
        drugs: getTreatmentNameFromEvidence(item)
      });
    });
    return treatments;
  }

  initLevelSelected(): { [level: string]: boolean } {
    return _.reduce(
      LEVELS,
      (acc, level) => {
        acc[level] = false;
        return acc;
      },
      {} as { [level: string]: boolean }
    );
  }

  @computed
  get hashQueries() {
    const queryString: Partial<HashQueries> = {};
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
    return queryString;
  }

  @computed
  get allTreatments() {
    let treatments: Treatment[] = [];
    _.forEach(this.evidencesByLevel.result, (content, levelOfEvidence) => {
      treatments = treatments.concat(this.getTreatments(content));
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
        this.relevantTumorTypes.result.filter(
          tumorType => tumorType === treatment.tumorType
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
      this.filteredTreatments.map(treatment => treatment.tumorType)
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
      levelNumbers[treatment.level].push(treatment.hugoSymbol);
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
          value: this.drugSearchKeyword
        }
      : null;
  }

  @computed
  get tumorTypeSelectValue() {
    return this.relevantTumorTypeSearchKeyword
      ? {
          label: this.relevantTumorTypeSearchKeyword,
          value: this.relevantTumorTypeSearchKeyword
        }
      : null;
  }

  @computed
  get geneSelectValue() {
    return this.geneSearchKeyword
      ? {
          label: this.geneSearchKeyword,
          value: this.geneSearchKeyword
        }
      : null;
  }

  @autobind
  @action
  updateLevelSelection(levelOfEvidence: string) {
    this.levelSelected[levelOfEvidence] = !this.levelSelected[levelOfEvidence];
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
    const content = [
      ['Level', 'Gene', 'Alterations', 'Tumor Type', 'Drugs'].join('\t')
    ];
    _.each(this.filteredTreatments, item => {
      content.push(
        [
          item.level,
          item.hugoSymbol,
          item.alterations.join(', '),
          item.tumorType,
          item.drugs
        ].join('\t')
      );
    });
    return Promise.resolve(content.join('\n'));
  }

  private columns = [
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL)
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.HUGO_SYMBOL),
      style: { whiteSpace: 'normal' },
      Cell(props: { original: Treatment }) {
        return <GenePageLink hugoSymbol={props.original.hugoSymbol} />;
      }
    },
    {
      id: 'alterations',
      Header: <span>Alterations</span>,
      accessor: 'alterations',
      minWidth: 200,
      style: { whiteSpace: 'normal' },
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell(props: { original: Treatment }) {
        return (
          <div style={{ display: 'block' }}>
            {' '}
            {props.original.alterations
              .map<React.ReactNode>((alteration, index: number) => (
                <AlterationPageLink
                  key={index}
                  hugoSymbol={props.original.hugoSymbol}
                  alteration={alteration}
                />
              ))
              .reduce((prev, curr) => [prev, ', ', curr])}
          </div>
        );
      }
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.TUMOR_TYPE),
      minWidth: 300,
      Cell(props: { original: Treatment }) {
        return <span>{props.original.tumorType}</span>;
      }
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
      minWidth: 300,
      style: { whiteSpace: 'normal' },
      Cell(props: { original: Treatment }) {
        return <span>{props.original.drugs}</span>;
      }
    }
  ];

  render() {
    return (
      <DocumentTitle title={DOCUMENT_TITLES.ACTIONABLE_GENES}>
        <If
          condition={
            this.allTumorTypes.isComplete && this.evidencesByLevel.isComplete
          }
        >
          <Then>
            <Row
              style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
              className={'mb-2'}
            >
              {LEVELS.map(level => (
                <Col
                  className={classnames(...COMPONENT_PADDING)}
                  lg={2}
                  xs={6}
                  key={level}
                >
                  <LevelButton
                    level={level}
                    numOfGenes={this.levelNumbers[level]}
                    description={LEVEL_BUTTON_DESCRIPTION[level]}
                    active={this.levelSelected[level]}
                    className="mb-2"
                    disabled={this.levelNumbers[level] === 0}
                    onClick={() => this.updateLevelSelection(level)}
                  />
                </Col>
              ))}
            </Row>
            <Row
              style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}
              className={'mb-2'}
            >
              <Col className={classnames(...COMPONENT_PADDING)} lg={4} xs={12}>
                <Select
                  value={this.geneSelectValue}
                  placeholder={`${
                    this.filteredGenes.length
                  } actionable ${pluralize('gene', this.filteredGenes.length)}`}
                  options={this.filteredGenes.map(hugoSymbol => {
                    return {
                      value: hugoSymbol,
                      label: hugoSymbol
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
              <Col className={classnames(...COMPONENT_PADDING)} lg={4} xs={12}>
                <Select
                  value={this.tumorTypeSelectValue}
                  placeholder="Search Tumor Type"
                  options={this.relevantTumorTypes.result.map(tumorType => {
                    return {
                      value: tumorType,
                      label: tumorType
                    };
                  })}
                  isClearable={true}
                  onChange={(selectedOption: any) =>
                    (this.relevantTumorTypeSearchKeyword = selectedOption
                      ? selectedOption.label
                      : '')
                  }
                />
              </Col>
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
                      label: drug
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
            </Row>
            <Row className={'mb-2'}>
              <Col className="d-flex">
                <span>
                  <b>{`Showing ${
                    this.filteredTreatments.length
                  } biomarker-drug  ${pluralize(
                    'association',
                    this.filteredTreatments.length
                  )}`}</b>
                  {` (${this.filteredGenes.length} ${pluralize(
                    'gene',
                    this.filteredGenes.length
                  )},
                ${this.filteredTumorTypes.length} ${pluralize(
                    'tumor type',
                    this.filteredTumorTypes.length
                  )},
                ${this.filteredLevels.length} ${pluralize(
                    'level of evidence',
                    this.filteredLevels.length
                  )})`}
                </span>
                <AuthDownloadButton
                  className={classnames('ml-2', 'pt-1')}
                  getDownloadData={this.downloadAssociation}
                  fileName={'oncokb_biomarker_drug_associations.tsv'}
                  buttonText={'Associations'}
                />
                {this.treatmentsAreFiltered ? (
                  <Button
                    variant="link"
                    style={{ whiteSpace: 'nowrap' }}
                    className={'ml-auto pr-0'}
                    onClick={this.clearFilters}
                  >
                    Reset filters
                  </Button>
                ) : (
                  undefined
                )}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <OncoKBTable
                  disableSearch={true}
                  data={this.filteredTreatments}
                  loading={this.relevantTumorTypes.isPending}
                  columns={this.columns}
                  pageSize={
                    this.filteredTreatments.length === 0 ? 1 : this.filteredTreatments.length
                  }
                  style={{
                    height: LG_TABLE_FIXED_HEIGHT
                  }}
                  defaultSorted={[
                    {
                      id: 'LEVEL',
                      desc: false
                    },
                    {
                      id: 'HUGO_SYMBOL',
                      desc: false
                    }
                  ]}
                />
              </Col>
            </Row>
          </Then>
          <Else>
            <LoadingIndicator
              size={'big'}
              center={true}
              isLoading={
                this.allTumorTypes.isPending || this.evidencesByLevel.isPending
              }
            />
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
