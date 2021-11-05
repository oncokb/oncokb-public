import React from 'react';
import { inject } from 'mobx-react';

import {
  AlterationPageLink,
  GenePageLink,
  OncoTreeLink,
} from 'app/shared/utils/UrlUtils';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_MARGIN_BOTTOM_LG,
  EVIDENCE_TYPES,
  REFERENCE_GENOME,
  TREATMENT_EVIDENCE_TYPES,
} from 'app/config/constants';
import styles from 'app/pages/alterationPage/AlterationPage.module.scss';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { AlterationInfo } from 'app/pages/annotationPage/AlterationInfo';
import { Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import { action, computed } from 'mobx';
import autobind from 'autobind-decorator';
import {
  Evidence,
  FdaAlteration,
  VariantAnnotation,
  VariantAnnotationTumorType,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { TherapeuticImplication } from 'app/store/AnnotationStore';
import {
  articles2Citations,
  getCancerTypeNameFromOncoTreeType,
  getHighestFdaLevel,
  getTreatmentNameFromEvidence,
  isPositionalAlteration,
  levelOfEvidence2Level,
} from 'app/shared/utils/Utils';
import _ from 'lodash';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import WithSeparator from 'react-with-separator';
import AppStore from 'app/store/AppStore';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';
import AlterationTableTabs from 'app/pages/annotationPage/AlterationTableTabs';

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
  [SummaryKey.TUMOR_TYPE_SUMMARY]: 'Therapeutic Summary',
  [SummaryKey.DIAGNOSTIC_SUMMARY]: 'Diagnostic Summary',
  [SummaryKey.PROGNOSTIC_SUMMARY]: 'Prognostic Summary',
};

const ONCOGENIC_MUTATIONS = 'Oncogenic Mutations';
const LOWERCASE_ONCOGENIC_MUTATIONS = ONCOGENIC_MUTATIONS.toLowerCase();

export type IAnnotationPage = {
  appStore?: AppStore;
  hugoSymbol: string;
  alteration: string;
  tumorType: string;
  refGenome: REFERENCE_GENOME;
  onChangeTumorType: (newTumorType: string) => void;
  annotation: VariantAnnotation;
  fdaAlterations?: FdaAlteration[];
  defaultSelectedTab?: ANNOTATION_PAGE_TAB_KEYS;
  onChangeTab?: (
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) => void;
};

@inject('appStore')
export default class AnnotationPage extends React.Component<
  IAnnotationPage,
  {}
> {
  getTherapeuticImplications(evidences: Evidence[]) {
    return evidences.map(evidence => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const alterations = _.chain(evidence.alterations)
        .filter(alteration =>
          alteration.referenceGenomes.includes(this.props.refGenome)
        )
        .value();
      const cancerTypes = evidence.cancerTypes.map(cancerType =>
        getCancerTypeNameFromOncoTreeType(cancerType)
      );
      return {
        level,
        alterations: alterations.map(alteration => alteration.name).join(', '),
        alterationsView: (
          <WithSeparator separator={', '}>
            {alterations.map(alteration => (
              <AlterationPageLink
                key={alteration.name}
                hugoSymbol={this.props.hugoSymbol}
                alteration={alteration.name}
                alterationRefGenomes={
                  alteration.referenceGenomes as REFERENCE_GENOME[]
                }
              />
            ))}
          </WithSeparator>
        ),
        drugs: getTreatmentNameFromEvidence(evidence),
        cancerTypes: cancerTypes.join(', '),
        cancerTypesView: (
          <WithSeparator separator={', '}>
            {cancerTypes.map(cancerType => (
              <AlterationPageLink
                key={`${this.props.alteration}-${cancerType}`}
                hugoSymbol={this.props.hugoSymbol}
                alteration={this.props.alteration}
                alterationRefGenomes={[this.props.refGenome]}
                cancerType={cancerType}
              >
                {cancerType}
              </AlterationPageLink>
            ))}
          </WithSeparator>
        ),
        citations: articles2Citations(evidence.articles),
      } as TherapeuticImplication;
    });
  }

  getEvidenceByEvidenceTypes(
    cancerTypes: VariantAnnotationTumorType[],
    evidenceTypes: EVIDENCE_TYPES[]
  ): Evidence[] {
    let uniqueEvidences: Evidence[] = [];
    cancerTypes.forEach(cancerType => {
      uniqueEvidences = uniqueEvidences.concat(
        cancerType.evidences.filter(evidence =>
          evidenceTypes.includes(evidence.evidenceType as EVIDENCE_TYPES)
        )
      );
    });

    return _.uniqBy(uniqueEvidences, evidence => evidence.id);
  }

  @computed
  get therapeuticImplications(): TherapeuticImplication[] {
    return this.getTherapeuticImplications(
      this.getEvidenceByEvidenceTypes(
        this.props.annotation.tumorTypes,
        TREATMENT_EVIDENCE_TYPES
      )
    );
  }

  @computed
  get diagnosticImplications(): TherapeuticImplication[] {
    return this.getTherapeuticImplications(
      this.getEvidenceByEvidenceTypes(this.props.annotation.tumorTypes, [
        EVIDENCE_TYPES.DIAGNOSTIC_IMPLICATION,
      ])
    );
  }

  @computed
  get prognosticImplications(): TherapeuticImplication[] {
    return this.getTherapeuticImplications(
      this.getEvidenceByEvidenceTypes(this.props.annotation.tumorTypes, [
        EVIDENCE_TYPES.PROGNOSTIC_IMPLICATION,
      ])
    );
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

  formatGroupLabel(data: any) {
    return <span>{data.label}</span>;
  }

  @computed get isOncogenicMutations() {
    return (
      this.props.alteration &&
      this.props.alteration
        .toLowerCase()
        .startsWith(LOWERCASE_ONCOGENIC_MUTATIONS)
    );
  }

  render() {
    return (
      <>
        <h2 className={'d-flex align-items-baseline'}>
          {this.props.alteration
            .toLowerCase()
            .includes(this.props.hugoSymbol.toLowerCase()) ? null : (
            <span className={'mr-2'}>
              <GenePageLink
                hugoSymbol={this.props.hugoSymbol}
                highlightContent={false}
              />
            </span>
          )}
          <span>{`${this.props.alteration}`}</span>
          <span style={{ fontSize: '0.5em' }} className={'ml-2'}>
            <FeedbackIcon
              feedback={{
                type: FeedbackType.ANNOTATION,
                annotation: {
                  gene: this.props.hugoSymbol,
                  alteration: this.props.alteration,
                  cancerType: this.props.tumorType,
                },
              }}
              appStore={this.props.appStore!}
            />
          </span>
        </h2>
        <AlterationInfo
          isPositionalAlteration={isPositionalAlteration(
            this.props.annotation.query.proteinStart,
            this.props.annotation.query.proteinEnd,
            this.props.annotation.query.consequence
          )}
          oncogenicity={this.props.annotation.oncogenic}
          mutationEffect={
            this.isOncogenicMutations
              ? undefined
              : this.props.annotation.mutationEffect
          }
          isVus={this.props.annotation.vus}
          highestSensitiveLevel={this.props.annotation.highestSensitiveLevel}
          highestResistanceLevel={this.props.annotation.highestResistanceLevel}
          highestDiagnosticImplicationLevel={
            this.props.annotation.highestDiagnosticImplicationLevel
          }
          highestPrognosticImplicationLevel={
            this.props.annotation.highestPrognosticImplicationLevel
          }
          highestFdaLevel={getHighestFdaLevel(this.props.fdaAlterations || [])}
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
                <CancerTypeSelect
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
                  tumorType={this.props.tumorType}
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
        {this.props.tumorType && !this.isOncogenicMutations ? (
          <Row>
            <Col>
              {this.tumorTypeSummaries.map((summary, index) => {
                return (
                  <div
                    className={DEFAULT_MARGIN_BOTTOM_LG}
                    key={`summary-${index}`}
                  >
                    <h6 className={'mb-0'}>{summary.title}</h6>
                    {summary.content}
                  </div>
                );
              })}
            </Col>
          </Row>
        ) : null}
        <Row className="mt-2">
          <Col>
            <AlterationTableTabs
              selectedTab={this.props.defaultSelectedTab}
              appStore={this.props.appStore}
              hugoSymbol={this.props.hugoSymbol}
              alteration={this.props.alteration}
              cancerType={this.props.tumorType}
              biological={[]}
              tx={this.therapeuticImplications}
              dx={this.diagnosticImplications}
              px={this.prognosticImplications}
              fda={this.props.fdaAlterations || []}
              onChangeTab={this.props.onChangeTab}
            />
          </Col>
        </Row>
      </>
    );
  }
}
