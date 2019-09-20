import React from 'react';
import { observer, inject } from 'mobx-react';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { Col, Row, Button } from 'react-bootstrap';
import classnames from 'classnames';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import { observable, computed, action } from 'mobx';
import { Evidence, MainType } from 'app/shared/api/generated/OncoKbPrivateAPI';
import Select from 'react-select';
import _ from 'lodash';
import { getCancerTypeNameFromOncoTreeType, levelOfEvidence2Level } from 'app/shared/utils/Utils';
import { TreatmentDrug } from 'app/shared/api/generated/OncoKbAPI';
import autobind from 'autobind-decorator';
import pluralize from 'pluralize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTable from 'react-table';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import { Else, Then, If } from 'react-if';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { LEVEL_OF_EVIDENCE } from 'app/config/constants';

const COMPONENT_PADDING = ['pl-2', 'pr-2'];
type Treatment = {
  level: string;
  hugoSymbol: string;
  alterations: string[];
  tumorType: string;
  treatments: {}[];
  uniqueDrugs: string[];
  drugs: string;
};

type EvidencesByLevel = { [level: string]: Evidence[] };
@inject('routing')
@observer
export default class ActionableGenesPage extends React.Component<{}> {
  @observable relevantTumorTypeSearchKeyword = '';
  @observable drugSearchKeyword = '';
  @observable geneSearchKeyword = '';
  @observable levelSelected = this.initLevelSelected();

  readonly allMainTypes = remoteData<MainType[]>({
    await: () => [],
    invoke: async () => {
      const result = await privateClient.utilsOncoTreeMainTypesGetUsingGET({});
      return result.sort();
    },
    default: []
  });

  readonly allTumorTypes = remoteData<string[]>({
    await: () => [this.allMainTypes, this.evidencesByLevel],
    invoke: async () => {
      let allTumorTypes: string[] = _.uniq(
        this.allMainTypes.result.filter(mainType => !mainType.name.endsWith('NOS')).map(mainType => mainType.name)
      );

      allTumorTypes = allTumorTypes.concat(this.allTreatments.map(treatment => treatment.tumorType));

      return Promise.resolve(_.uniq(allTumorTypes));
    },
    default: []
  });

  readonly evidencesByLevel = remoteData<EvidencesByLevel>({
    await: () => [],
    invoke: async () => {
      return await privateClient.utilsEvidencesByLevelsGetUsingGET({});
    },
    default: {}
  });

  readonly relevantTumorTypes = remoteData<string[]>({
    await: () => [this.allTumorTypes],
    invoke: async () => {
      let result = [];
      if (this.relevantTumorTypeSearchKeyword) {
        const allRelevantTumorTypes = await privateClient.utilRelevantTumorTypesGetUsingGET({
          tumorType: this.relevantTumorTypeSearchKeyword
        });
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

  getDrugNameFromTreatment(drug: TreatmentDrug) {
    // @ts-ignore
    return drug.drugName;
  }

  getTreatments(evidences: Evidence[]) {
    const treatments: Treatment[] = [];
    _.forEach(evidences, (item: Evidence) => {
      treatments.push({
        level: _.replace(item.levelOfEvidence, new RegExp('[AB]'), ''),
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
              const result: string[] = treatment.drugs.map(drug => this.getDrugNameFromTreatment(drug));
              // @ts-ignore
              return acc.concat(result);
            },
            []
          )
        ),
        drugs: item.treatments
          .map(treatment =>
            treatment.drugs
              .map(drug => this.getDrugNameFromTreatment(drug))
              .sort()
              .join(' + ')
          )
          .sort()
          .join(', ')
      });
    });
    return treatments;
  }

  initLevelSelected(): { [level: string]: boolean } {
    return _.reduce(
      LEVEL_OF_EVIDENCE,
      (acc, level) => {
        acc[level] = false;
        return acc;
      },
      {} as { [level: string]: boolean }
    );
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
      if (this.geneSearchKeyword && treatment.hugoSymbol !== this.geneSearchKeyword) {
        match = false;
      }
      if (
        this.relevantTumorTypeSearchKeyword &&
        this.relevantTumorTypes.result.filter(tumorType => tumorType === treatment.tumorType).length === 0
      ) {
        match = false;
      }
      if (this.drugSearchKeyword && !treatment.uniqueDrugs.includes(this.drugSearchKeyword)) {
        match = false;
      }
      if (this.selectedLevels.length > 0 && !this.selectedLevels.includes(treatment.level)) {
        match = false;
      }
      return match;
    });
  }

  @computed
  get secondLayerFilterEnabled() {
    return !!this.geneSearchKeyword || !!this.relevantTumorTypeSearchKeyword || !!this.drugSearchKeyword;
  }

  @computed
  get treatmentsAreFiltered() {
    return this.selectedLevels.length > 0 || this.secondLayerFilterEnabled;
  }

  @computed
  get filteredGenes() {
    return _.uniq(this.filteredTreatments.map(treatment => treatment.hugoSymbol)).sort();
  }

  @computed
  get filteredDrugs() {
    return _.uniq(_.flatten(this.filteredTreatments.map(treatment => treatment.uniqueDrugs))).sort();
  }

  @computed
  get filteredTumorTypes() {
    return _.uniq(this.filteredTreatments.map(treatment => treatment.tumorType));
  }

  @computed
  get levelNumbers() {
    const levelNumbers = _.reduce(
      LEVEL_OF_EVIDENCE,
      (acc, level) => {
        acc[level] = [];
        return acc;
      },
      {} as { [level: string]: string[] }
    );

    // when there is no second layer filtering enabled, we allow to choose multiple levels
    const treatmentSource = this.secondLayerFilterEnabled ? this.filteredTreatments : this.allTreatments;
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
    return !!this.drugSearchKeyword
      ? {
          label: this.drugSearchKeyword,
          value: this.drugSearchKeyword
        }
      : null;
  }

  @computed
  get tumorTypeSelectValue() {
    return !!this.relevantTumorTypeSearchKeyword
      ? {
          label: this.relevantTumorTypeSearchKeyword,
          value: this.relevantTumorTypeSearchKeyword
        }
      : null;
  }

  @computed
  get geneSelectValue() {
    return !!this.geneSearchKeyword
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

  private columns = [
    {
      id: 'level',
      Header: <span>Level</span>,
      accessor: 'level',
      style: { justifyContent: 'center', display: 'flex', alignItems: 'center' },
      minWidth: 70,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell: (props: { original: Treatment }) => {
        return <i className={`oncokb level-icon level-${levelOfEvidence2Level(props.original.level)}`} />;
      }
    },
    {
      id: 'hugoSymbol',
      Header: <span>Gene</span>,
      accessor: 'hugoSymbol',
      style: { whiteSpace: 'normal' },
      minWidth: 100,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell: (props: { original: Treatment }) => {
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
      Cell: (props: { original: Treatment }) => {
        return props.original.alterations
          .map<React.ReactNode>(alteration => <AlterationPageLink hugoSymbol={props.original.hugoSymbol} alteration={alteration} />)
          .reduce((prev, curr) => [prev, ', ', curr]);
      }
    },
    {
      id: 'tumorType',
      Header: <span>Tumor Type</span>,
      accessor: 'tumorType',
      minWidth: 300,
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell: (props: { original: Treatment }) => {
        return <span>{props.original.tumorType}</span>;
      }
    },
    {
      id: 'drugs',
      Header: <span>Drugs</span>,
      accessor: 'drugs',
      minWidth: 300,
      style: { whiteSpace: 'normal' },
      defaultSortDesc: false,
      sortMethod: defaultSortMethod,
      Cell: (props: { original: Treatment }) => {
        return <span>{props.original.drugs}</span>;
      }
    }
  ];

  render() {
    return (
      <If condition={this.allTumorTypes.isComplete && this.evidencesByLevel.isComplete}>
        <Then>
          <>
            <Row style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }} className={'mb-2'}>
              {LEVEL_OF_EVIDENCE.map(level => (
                <Col className={classnames(...COMPONENT_PADDING)} lg={2} xs={4} key={level}>
                  <LevelButton
                    levelOfEvidence={level}
                    numOfGenes={this.levelNumbers[level]}
                    active={this.levelSelected[level]}
                    className="mb-2"
                    disabled={this.levelNumbers[level] === 0}
                    onClick={() => this.updateLevelSelection(level)}
                  />
                </Col>
              ))}
            </Row>
            <Row style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }} className={'mb-2'}>
              <Col className={classnames(...COMPONENT_PADDING)} xs={4}>
                <Select
                  value={this.geneSelectValue}
                  placeholder={`${this.filteredGenes.length} actionable ${pluralize('gene', this.filteredGenes.length)}`}
                  options={this.filteredGenes.map(hugoSymbol => {
                    return {
                      value: hugoSymbol,
                      label: hugoSymbol
                    };
                  })}
                  isClearable={true}
                  onChange={(selectedOption: any) => (this.geneSearchKeyword = selectedOption ? selectedOption.label : '')}
                />
              </Col>
              <Col className={classnames(...COMPONENT_PADDING)} xs={4}>
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
                  onChange={(selectedOption: any) => (this.relevantTumorTypeSearchKeyword = selectedOption ? selectedOption.label : '')}
                />
              </Col>
              <Col className={classnames(...COMPONENT_PADDING)} xs={4}>
                <Select
                  value={this.drugSelectValue}
                  placeholder={`${this.filteredDrugs.length} ${pluralize('drug', this.filteredDrugs.length)}`}
                  options={this.filteredDrugs.map(drug => {
                    return {
                      value: drug,
                      label: drug
                    };
                  })}
                  isClearable={true}
                  onChange={(selectedOption: any) => (this.drugSearchKeyword = selectedOption ? selectedOption.label : '')}
                />
              </Col>
            </Row>
            <Row className={'mb-2'}>
              <Col className="d-flex">
                <span>
                  <b>{`Showing ${this.filteredTreatments.length} biomarker-drug  ${pluralize(
                    'association',
                    this.filteredTreatments.length
                  )}`}</b>
                  {` (${this.filteredGenes.length} ${pluralize('gene', this.filteredGenes.length)},
                ${this.filteredTumorTypes.length} ${pluralize('tumor type', this.filteredTumorTypes.length)},
                ${this.filteredLevels.length} ${pluralize('level of evidence', this.filteredLevels.length)})`}
                </span>
                <Button size={'sm'} className={classnames('ml-2', 'pt-1')} onClick={() => {}}>
                  <FontAwesomeIcon icon={'cloud-download-alt'} className={'mr-1'} fixedWidth />
                  Associations
                </Button>
                {this.treatmentsAreFiltered ? (
                  <Button variant="link" style={{ whiteSpace: 'nowrap' }} className={'ml-auto pr-0'} onClick={this.clearFilters}>
                    Reset filters
                  </Button>
                ) : (
                  undefined
                )}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <ReactTable
                  data={this.filteredTreatments}
                  loading={this.relevantTumorTypes.isPending}
                  columns={this.columns}
                  showPagination={false}
                  defaultPageSize={this.filteredTreatments.length}
                  defaultSorted={[
                    {
                      id: 'level',
                      desc: false
                    },
                    {
                      id: 'hugoSymbol',
                      desc: false
                    }
                  ]}
                  style={{
                    height: 500
                  }}
                  className="-striped -highlight"
                />
              </Col>
            </Row>
          </>
        </Then>
        <Else>
          <LoadingIndicator size={'big'} center={true} isLoading={this.allTumorTypes.isPending || this.evidencesByLevel.isPending} />
        </Else>
      </If>
    );
  }
}
