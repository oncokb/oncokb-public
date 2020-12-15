import React from 'react';

import { GenePageLink, OncoTreeLink } from 'app/shared/utils/UrlUtils';
import {
  DEFAULT_MARGIN_BOTTOM_LG,
  EVIDENCE_TYPES,
  TABLE_COLUMN_KEY,
  TREATMENT_EVIDENCE_TYPES,
} from 'app/config/constants';
import styles from 'app/pages/alterationPage/AlterationPage.module.scss';
import InfoIcon from 'app/shared/icons/InfoIcon';
import OncoKBTable, {
  SearchColumn,
} from 'app/components/oncokbTable/OncoKBTable';
import { AlterationInfo } from 'app/pages/annotationPage/AlterationInfo';
import { Row, Col, Button } from 'react-bootstrap';
import classnames from 'classnames';
import { computed, action } from 'mobx';
import autobind from 'autobind-decorator';
import {
  TumorType,
  VariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { TherapeuticImplication } from 'app/store/AnnotationStore';
import {
  articles2Citations,
  getCancerTypeNameFromOncoTreeType,
  getDefaultColumnDefinition,
  getTreatmentNameFromEvidence,
  levelOfEvidence2Level,
} from 'app/shared/utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { CitationTooltip } from 'app/components/CitationTooltip';
import Select from 'react-select';
import _ from 'lodash';

enum SummaryKey {
  GENE_SUMMARY = 'geneSummary',
  ALTERATION_SUMMARY = 'variantSummary',
  TUMOR_TYPE_SUMMARY = 'tumorTypeSummary',
  DIAGNOSTIC_SUMMARY = 'diagnosticSummary',
  PROGNOSTIC_SUMMARY = 'prognosticSummary',
}

const SUMMARY_TITLE = {
  [SummaryKey.GENE_SUMMARY]: 'Gene Summary',
  [SummaryKey.ALTERATION_SUMMARY]: 'Alteration Summary',
  [SummaryKey.TUMOR_TYPE_SUMMARY]: 'Cancer Type Summary',
  [SummaryKey.DIAGNOSTIC_SUMMARY]: 'Diagnostic Summary',
  [SummaryKey.PROGNOSTIC_SUMMARY]: 'Prognostic Summary',
};

const ONCOGENIC_MUTATIONS = 'Oncogenic Mutations';
const LOWERCASE_ONCOGENIC_MUTATIONS = ONCOGENIC_MUTATIONS.toLowerCase();

export type IAnnotationPage = {
  hugoSymbol: string;
  alteration: string;
  tumorType: string;
  onChangeTumorType: (newTumorType: string) => void;
  allTumorTypesOptions: any;
  allSubtypes: TumorType[];
  annotation: VariantAnnotation;
};
export default class AnnotationPage extends React.Component<IAnnotationPage> {
  @computed
  get therapeuticImplications(): TherapeuticImplication[] {
    return _.reduce(
      this.props.annotation.tumorTypes,
      (acc, next) => {
        const oncoTreeCancerType = getCancerTypeNameFromOncoTreeType(
          next.tumorType
        );
        next.evidences.forEach(evidence => {
          if (
            TREATMENT_EVIDENCE_TYPES.includes(
              evidence.evidenceType as EVIDENCE_TYPES
            )
          ) {
            const level = levelOfEvidence2Level(evidence.levelOfEvidence);
            acc.push({
              level,
              alterations: evidence.alterations
                .map(alteration => alteration.name)
                .join(', '),
              drugs: getTreatmentNameFromEvidence(evidence),
              cancerTypes: oncoTreeCancerType,
              citations: articles2Citations(evidence.articles),
            });
          }
        });
        return acc;
      },
      [] as TherapeuticImplication[]
    );
  }

  @computed
  get tumorTypeSelectValue() {
    if (this.props.tumorType) {
      const matchedSubtype = _.find(
        this.props.allSubtypes,
        tumorType => tumorType.code === this.props.tumorType
      );
      if (matchedSubtype) {
        return {
          label: matchedSubtype.name,
          value: matchedSubtype.code,
        };
      } else {
        return {
          label: this.props.tumorType,
          value: this.props.tumorType,
        };
      }
    } else {
      return null;
    }
  }

  @autobind
  @action
  updateTumorTypeQuery(selectedOption: any) {
    this.props.onChangeTumorType(selectedOption ? selectedOption.value : '');
  }

  @computed
  get alterationSummaries() {
    const orderedSummaries = [
      SummaryKey.GENE_SUMMARY,
      SummaryKey.ALTERATION_SUMMARY,
    ];
    return this.getSummaries(orderedSummaries);
  }

  @computed
  get tumorTypeSummaries() {
    const orderedSummaries = this.props.tumorType
      ? [
          SummaryKey.TUMOR_TYPE_SUMMARY,
          SummaryKey.DIAGNOSTIC_SUMMARY,
          SummaryKey.PROGNOSTIC_SUMMARY,
        ]
      : [];
    return this.getSummaries(orderedSummaries);
  }

  getSummaries(orderedSummaries: string[]) {
    return _.reduce(
      orderedSummaries,
      (acc, next) => {
        if (this.props.annotation[next]) {
          acc.push({
            key: next,
            title: SUMMARY_TITLE[next],
            content: this.props.annotation[next],
          });
        }
        return acc;
      },
      [] as { key: string; title: string; content: string }[]
    );
  }

  @computed
  get therapeuticTableColumns(): SearchColumn<TherapeuticImplication>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATIONS),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE),
        Cell: (props: { original: any }) => {
          return (
            <Button
              style={{
                padding: 0,
              }}
              variant={'link'}
              onClick={() =>
                this.props.onChangeTumorType(props.original.cancerTypes)
              }
            >
              {props.original.cancerTypes}
            </Button>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
        Cell(props: { original: TherapeuticImplication }) {
          const numOfReferences =
            props.original.citations.abstracts.length +
            props.original.citations.pmids.length;
          return (
            <DefaultTooltip
              placement={'left'}
              overlay={() => (
                <CitationTooltip
                  pmids={props.original.citations.pmids}
                  abstracts={props.original.citations.abstracts}
                />
              )}
            >
              <span>{numOfReferences}</span>
            </DefaultTooltip>
          );
        },
      },
    ];
  }

  formatGroupLabel(data: any) {
    return <span>{data.label}</span>;
  }

  @computed get isOncogenicMutations() {
    return (
      this.props.alteration &&
      this.props.alteration.toLowerCase() === LOWERCASE_ONCOGENIC_MUTATIONS
    );
  }

  render() {
    return (
      <>
        <h2 className={'d-flex align-items-center'}>
          <GenePageLink
            hugoSymbol={this.props.hugoSymbol}
            highlightContent={false}
          />
          <span className={'ml-2'}>{` ${this.props.alteration}`}</span>
        </h2>
        <AlterationInfo
          oncogenicity={this.props.annotation.oncogenic}
          mutationEffect={this.props.annotation.mutationEffect}
          isVus={this.props.annotation.vus}
          highestSensitiveLevel={this.props.annotation.highestSensitiveLevel}
          highestResistanceLevel={this.props.annotation.highestResistanceLevel}
        />
        <Row>
          <Col>
            {this.alterationSummaries.map(summary => {
              return (
                <div key={summary.content} className={DEFAULT_MARGIN_BOTTOM_LG}>
                  {summary.content}
                </div>
              );
            })}
          </Col>
        </Row>
        <Row>
          <Col>
            <div
              className={`d-flex align-items-center ${DEFAULT_MARGIN_BOTTOM_LG}`}
            >
              <span
                className={classnames(styles.headerTumorTypeSelection, 'mr-2')}
              >
                <Select
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      height: '30px',
                      minHeight: '30px',
                    }),
                    dropdownIndicator: base => ({
                      ...base,
                      padding: 4,
                    }),
                    clearIndicator: base => ({
                      ...base,
                      padding: 4,
                    }),
                    valueContainer: base => ({
                      ...base,
                      padding: '0px 6px',
                    }),
                    input: base => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                    }),
                  }}
                  value={this.tumorTypeSelectValue}
                  placeholder="Select a cancer type"
                  options={this.props.allTumorTypesOptions}
                  formatGroupLabel={this.formatGroupLabel}
                  isClearable={true}
                  onChange={(selectedOption: any) =>
                    this.updateTumorTypeQuery(selectedOption)
                  }
                />
              </span>
              <InfoIcon
                overlay={
                  <span>
                    For cancer type specific information, please select a cancer
                    type from the dropdown. The cancer type is curated using{' '}
                    <OncoTreeLink />
                  </span>
                }
                placement="top"
              />
            </div>
          </Col>
        </Row>
        {this.props.tumorType ? (
          <Row>
            <Col>
              {this.tumorTypeSummaries.map((summary, index) => {
                return (
                  <div
                    className={DEFAULT_MARGIN_BOTTOM_LG}
                    key={`summary-${index}`}
                  >
                    {summary.content}
                  </div>
                );
              })}
            </Col>
          </Row>
        ) : null}
        {this.therapeuticImplications.length > 0 ? (
          <Row>
            <Col>
              <OncoKBTable
                data={this.therapeuticImplications}
                columns={this.therapeuticTableColumns}
                pageSize={
                  this.therapeuticImplications.length === 0
                    ? 1
                    : this.therapeuticImplications.length
                }
                // loading={this.props.annotationResult.isPending}
                disableSearch={true}
                defaultSorted={[
                  {
                    id: TABLE_COLUMN_KEY.LEVEL,
                    desc: false,
                  },
                  {
                    id: TABLE_COLUMN_KEY.ALTERATION,
                    desc: false,
                  },
                ]}
              />
            </Col>
          </Row>
        ) : null}
      </>
    );
  }
}
