import React from 'react';
import { observer, inject } from 'mobx-react';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import { remoteData } from 'cbioportal-frontend-commons';
import { observable, computed, action } from 'mobx';
import { Evidence, MainType } from 'app/shared/api/generated/OncoKbPrivateAPI';
import Select from 'react-select';
import _ from 'lodash';
import { getCancerTypeNameFromOncoTreeType } from 'app/shared/utils/Utils';
import { TreatmentDrug } from 'app/shared/api/generated/OncoKbAPI';
import autobind from 'autobind-decorator';
import pluralize from 'pluralize';

const LEVELS = [
  {
    url: 'LEVEL_1',
    variable: 'one'
  },
  {
    url: 'LEVEL_2',
    variable: 'two'
  },
  {
    url: 'LEVEL_3',
    variable: 'three'
  },
  {
    url: 'LEVEL_4',
    variable: 'four'
  },
  {
    url: 'LEVEL_R1',
    variable: 'r1'
  },
  {
    url: 'LEVEL_R2',
    variable: 'r2'
  }
];
type Treatment = {
  level: string;
  hugoSymbol: string;
  alterations: string[];
  tumorType: string;
  treatments: {}[];
  uniqueDrugs: string[];
  drugs: string;
};

// type StatItem = {
//   name: string,
//   count: number
// }
// type Stats = {
//   genes: {
//     levels: geneLeveles,
//     total: StatItem[]
//   },
//   levels: _.keys(geneLeveles),
//   treatments: treatments,
//   drugs: StatItem[],
//   tumorTypes: reduceObject2Array(tumorTypes)
// }

type EvidencesByLevel = { [level: string]: Evidence[] };
@inject('routing')
@observer
export default class ActionableGenesPage extends React.Component<{}> {
  @observable alterationSearchKeyword = '';
  @observable relevantTumorTypeSearchKeyword = '';
  @observable drugSearchKeyword = '';
  @observable geneSearchKeyword = '';
  @observable levelSelected: { [level: string]: boolean } = _.reduce(
    LEVELS,
    (acc, level) => {
      acc[level.url] = false;
      return acc;
    },
    {}
  );

  readonly allMainTypes = remoteData<MainType[]>({
    await: () => [],
    invoke: async () => {
      const result = await privateClient.utilsOncoTreeMainTypesGetUsingGET({});
      return result.sort();
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
    await: () => [this.allMainTypes],
    invoke: async () => {
      let result = [];
      if (this.relevantTumorTypeSearchKeyword) {
        const allRelevantTumorTypes = await privateClient.utilRelevantTumorTypesGetUsingGET({
          tumorType: this.relevantTumorTypeSearchKeyword
        });
        result = allRelevantTumorTypes.filter(tumorType => !!tumorType.mainType.name).map(tumorType => tumorType.mainType.name);
      } else {
        result = this.allMainTypes.result.map(mainType => mainType.name);
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
    let treatments: Treatment[] = [];
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
      if (this.relevantTumorTypeSearchKeyword && this.relevantTumorTypes.result.includes(treatment.tumorType)) {
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
  get filteredGenes() {
    return _.uniq(this.filteredTreatments.map(treatment => treatment.hugoSymbol)).sort();
  }

  @computed
  get filteredDrugs() {
    return _.uniq(_.flatten(this.filteredTreatments.map(treatment => treatment.uniqueDrugs))).sort();
  }

  @computed
  get levelNumbers() {
    let levelNumbers = _.reduce(
      LEVELS,
      (acc, level) => {
        acc[level.url] = [];
        return acc;
      },
      {}
    );

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
      {}
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

  @autobind
  @action
  updateLevelSelection(levelOfEvidence: string) {
    this.levelSelected[levelOfEvidence] = !this.levelSelected[levelOfEvidence];
  }

  componentPadding(): string[] {
    return ['pl-2', 'pr-2'];
  }

  render() {
    return (
      <>
        <Row style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
          {LEVELS.map(level => (
            <Col className={classnames(...this.componentPadding())} lg={2} xs={4}>
              <LevelButton
                levelOfEvidence={level.url}
                numOfGenes={this.levelNumbers[level.url]}
                active={this.levelSelected[level.url]}
                className="mb-2"
                disabled={!this.filteredLevels.includes(level.url)}
                onClick={() => this.updateLevelSelection(level.url)}
              />
            </Col>
          ))}
        </Row>
        <Row style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
          <Col className={classnames(...this.componentPadding())} xs={4}>
            <Select
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
          <Col className={classnames(...this.componentPadding())} xs={4}>
            <Select
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
          <Col className={classnames(...this.componentPadding())} xs={4}>
            <Select
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
        <Row>{this.filteredTreatments.length}</Row>
      </>
    );
  }
}
