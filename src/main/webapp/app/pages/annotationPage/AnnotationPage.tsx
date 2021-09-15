import React from 'react';
import { inject } from 'mobx-react';

import { GenePageLink, OncoTreeLink } from 'app/shared/utils/UrlUtils';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  ANNOTATION_PAGE_TAB_NAMES,
  DEFAULT_MARGIN_BOTTOM_LG,
  DEFAULT_MESSAGE_HEME_ONLY_DX,
  DEFAULT_MESSAGE_HEME_ONLY_PX,
  EVIDENCE_TYPES,
  LEVEL_TYPE_NAMES,
  LEVEL_TYPES,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
  TREATMENT_EVIDENCE_TYPES,
} from 'app/config/constants';
import styles from 'app/pages/alterationPage/AlterationPage.module.scss';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import { AlterationInfo } from 'app/pages/annotationPage/AlterationInfo';
import { Button, Col, Row } from 'react-bootstrap';
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
  getDefaultColumnDefinition,
  getTreatmentNameFromEvidence,
  levelOfEvidence2Level,
} from 'app/shared/utils/Utils';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { CitationTooltip } from 'app/components/CitationTooltip';
import _ from 'lodash';
import { AnnotationPageTable } from './AnnotationPageTable';
import Tabs from 'react-responsive-tabs';
import CancerTypeSelect from 'app/shared/dropdown/CancerTypeSelect';
import WithSeparator from 'react-with-separator';
import AppStore from 'app/store/AppStore';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';
import { FDA_ALTERATIONS_TABLE_COLUMNS } from 'app/pages/genePage/FdaUtils';
import { GenePageTable } from 'app/pages/genePage/GenePageTable';

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
};

@inject('appStore')
export default class AnnotationPage extends React.Component<IAnnotationPage> {
  getTherapeuticImplications(evidences: Evidence[]) {
    return evidences.map(evidence => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const cancerTypes = evidence.cancerTypes.map(cancerType =>
        getCancerTypeNameFromOncoTreeType(cancerType)
      );
      return {
        level,
        alterations: _.chain(evidence.alterations)
          .filter(alteration =>
            alteration.referenceGenomes.includes(this.props.refGenome)
          )
          .map(alteration => alteration.name)
          .join(', ')
          .value(),
        drugs: getTreatmentNameFromEvidence(evidence),
        cancerTypes,
        citations: articles2Citations(evidence.articles),
      };
    });
  }

  getEvidenceByEvidenceTypes(
    cancerTypes: VariantAnnotationTumorType[],
    evidenceTypes: EVIDENCE_TYPES[]
  ) {
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
        Cell: (props: { original: TherapeuticImplication }) => {
          return (
            <WithSeparator separator={', '}>
              {props.original.cancerTypes.map((cancerType: string) => (
                <Button
                  style={{
                    padding: 0,
                  }}
                  variant={'link'}
                  onClick={() => this.props.onChangeTumorType(cancerType)}
                >
                  {cancerType}
                </Button>
              ))}
            </WithSeparator>
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

  getCancerTypesCell(cancerTypes: string[]) {
    return (
      <WithSeparator separator={', '}>
        {cancerTypes.map((cancerType: string) => (
          <Button
            style={{
              padding: 0,
            }}
            variant={'link'}
            onClick={() => this.props.onChangeTumorType(cancerType)}
          >
            {cancerType}
          </Button>
        ))}
      </WithSeparator>
    );
  }

  @computed
  get dxpxTableColumns(): SearchColumn<TherapeuticImplication>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATIONS),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE),
        minWidth: 250,
        Cell: (props: { original: any }) =>
          this.getCancerTypesCell(props.original.cancerTypes),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
        minWidth: 50,
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

  @computed
  get tabDefaultActiveKey() {
    if (this.therapeuticImplications.length > 0) {
      return LEVEL_TYPES.TX;
    } else if (this.diagnosticImplications.length > 0) {
      return LEVEL_TYPES.DX;
    }
    return LEVEL_TYPES.PX;
  }

  getTable(key: LEVEL_TYPES) {
    switch (key) {
      case LEVEL_TYPES.TX:
        return (
          <AnnotationPageTable
            implicationType={LEVEL_TYPES.TX}
            implicationData={this.therapeuticImplications}
            column={this.therapeuticTableColumns}
          />
        );
      case LEVEL_TYPES.DX:
        return (
          <AnnotationPageTable
            implicationType={LEVEL_TYPES.DX}
            implicationData={this.diagnosticImplications}
            column={this.dxpxTableColumns}
          />
        );
      case LEVEL_TYPES.PX:
        return (
          <AnnotationPageTable
            implicationType={LEVEL_TYPES.PX}
            implicationData={this.prognosticImplications}
            column={this.dxpxTableColumns}
          />
        );
      case LEVEL_TYPES.FDA:
        return (
          <GenePageTable
            data={this.props.fdaAlterations ? this.props.fdaAlterations : []}
            columns={FDA_ALTERATIONS_TABLE_COLUMNS}
            isPending={false}
          />
        );
      default:
        return <span />;
    }
  }

  readonly tabDescription: { [key in LEVEL_TYPES]: string } = {
    [LEVEL_TYPES.TX]: '',
    [LEVEL_TYPES.DX]: DEFAULT_MESSAGE_HEME_ONLY_DX,
    [LEVEL_TYPES.PX]: DEFAULT_MESSAGE_HEME_ONLY_PX,
    [LEVEL_TYPES.FDA]: '',
  };

  getTabContent(key: LEVEL_TYPES) {
    return (
      <div>
        {this.tabDescription[key] ? (
          <div>{this.tabDescription[key]}</div>
        ) : null}
        {this.getTable(key)}
      </div>
    );
  }

  @computed
  get tabs() {
    const tabs: { title: string; key: LEVEL_TYPES }[] = [];
    if (this.therapeuticImplications.length > 0) {
      tabs.push({
        key: LEVEL_TYPES.TX,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.TX]}`,
      });
    }
    if (this.diagnosticImplications.length > 0) {
      tabs.push({
        key: LEVEL_TYPES.DX,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.DX]}`,
      });
    }
    if (this.prognosticImplications.length > 0) {
      tabs.push({
        key: LEVEL_TYPES.PX,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.PX]}`,
      });
    }
    if (this.props.fdaAlterations && this.props.fdaAlterations.length > 0) {
      tabs.push({
        key: LEVEL_TYPES.FDA,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.FDA]}`,
      });
    }
    return tabs.map(tab => {
      return {
        title: tab.title,
        getContent: () => this.getTabContent(tab.key),
        key: tab.key,
        panelClassName: styles.panel,
      };
    });
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
            <Tabs
              items={this.tabs}
              transform={false}
              selectedTabKey={this.tabDefaultActiveKey}
            />
          </Col>
        </Row>
      </>
    );
  }
}
