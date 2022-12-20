import React from 'react';
import { inject, observer } from 'mobx-react';

import {
  AlterationPageLink,
  GenePageLink,
  OncoTreeLink,
} from 'app/shared/utils/UrlUtils';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_MARGIN_BOTTOM_LG,
  EVIDENCE_TYPES,
  ONCOGENIC_MUTATIONS,
  OTHER_BIOMARKERS,
  REFERENCE_GENOME,
  TREATMENT_EVIDENCE_TYPES,
} from 'app/config/constants';
import styles from 'app/pages/alterationPage/AlterationPage.module.scss';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { AlterationInfo } from 'app/pages/annotationPage/AlterationInfo';
import { Col, Row } from 'react-bootstrap';
import classnames from 'classnames';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import {
  BiologicalVariant,
  EnsemblGene,
  Evidence,
  VariantAnnotation,
  VariantAnnotationTumorType,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  FdaImplication,
  TherapeuticImplication,
} from 'app/store/AnnotationStore';
import {
  articles2Citations,
  getAlterationName,
  getCancerTypeNameFromOncoTreeType,
  getCancerTypesName,
  getCategoricalAlterationDescription,
  getTreatmentNameFromEvidence,
  isCategoricalAlteration,
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
import { Alteration } from 'app/shared/api/generated/OncoKbAPI';
import { getUniqueFdaImplications } from 'app/pages/annotationPage/Utils';
import ShowHideToggleIcon from 'app/shared/icons/ShowHideToggleIcon';
import SummaryWithRefs from 'app/oncokb-frontend-commons/src/components/SummaryWithRefs';

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

export type IAnnotationPage = {
  appStore?: AppStore;
  hugoSymbol: string;
  oncogene?: boolean;
  tsg?: boolean;
  ensemblGenes: EnsemblGene[];
  alteration: string;
  matchedAlteration: Alteration | undefined;
  tumorType: string;
  refGenome: REFERENCE_GENOME;
  onChangeTumorType: (newTumorType: string) => void;
  annotation: VariantAnnotation;
  biologicalAlterations?: BiologicalVariant[];
  relevantAlterations?: Alteration[];
  defaultSelectedTab?: ANNOTATION_PAGE_TAB_KEYS;
  onChangeTab?: (
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) => void;
};

const MutationEffectInformation: React.FunctionComponent<{
  show: boolean;
  mutationEffect: string | undefined;
  onClick: () => void;
  className?: string;
}> = props => {
  return (
    <div className={props.className}>
      <div onClick={() => props.onClick()}>
        <i>{`${props.show ? 'Hide' : 'Show'} mutation effect description`}</i>{' '}
        <ShowHideToggleIcon show={props.show} onToggle={() => {}} />
      </div>
      {props.show ? (
        <SummaryWithRefs
          content={
            props.mutationEffect
              ? props.mutationEffect
              : 'Mutation effect description is not available.'
          }
          type="linkout"
        />
      ) : undefined}
    </div>
  );
};

@inject('appStore')
@observer
export default class AnnotationPage extends React.Component<
  IAnnotationPage,
  {}
> {
  @observable showMutationEffect = true;

  constructor(props: any) {
    super(props);
    if (this.props.tumorType) {
      this.showMutationEffect = false;
    }
  }

  @computed
  get mutationEffectDescription() {
    return this.props.biologicalAlterations?.find(
      mutationEffect =>
        mutationEffect.variant.alteration === this.props.alteration
    )?.mutationEffectDescription;
  }

  @action.bound
  toggleMutationEffect(value: boolean) {
    this.showMutationEffect = value;
  }

  getImplications(evidences: Evidence[]) {
    return evidences.map(evidence => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const fdaLevel = levelOfEvidence2Level(evidence.fdaLevel);
      const alterations = _.chain(evidence.alterations)
        .filter(alteration =>
          alteration.referenceGenomes.includes(this.props.refGenome)
        )
        .value();
      const cancerTypes = evidence.cancerTypes.map(cancerType =>
        getCancerTypeNameFromOncoTreeType(cancerType)
      );
      const excludedCancerTypes = evidence.excludedCancerTypes.map(ct =>
        getCancerTypeNameFromOncoTreeType(ct)
      );
      return {
        level,
        fdaLevel,
        drugDescription: evidence.description,
        alterations: alterations.map(alteration => alteration.name).join(', '),
        alterationsView: (
          <WithSeparator separator={', '}>
            {alterations.map(alteration => (
              <AlterationPageLink
                key={alteration.name}
                hugoSymbol={this.props.hugoSymbol}
                alteration={{
                  alteration: alteration.alteration,
                  name: alteration.name,
                }}
                alterationRefGenomes={
                  alteration.referenceGenomes as REFERENCE_GENOME[]
                }
              />
            ))}
          </WithSeparator>
        ),
        drugs: getTreatmentNameFromEvidence(evidence),
        cancerTypes: getCancerTypesName(cancerTypes, excludedCancerTypes),
        cancerTypesView: (
          <>
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
            {excludedCancerTypes.length > 0 ? (
              <span> (excluding {excludedCancerTypes.join(', ')})</span>
            ) : (
              <></>
            )}
          </>
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
    return this.getImplications(
      this.getEvidenceByEvidenceTypes(
        this.props.annotation.tumorTypes,
        TREATMENT_EVIDENCE_TYPES
      )
    );
  }

  @computed
  get fdaImplication(): FdaImplication[] {
    const evidences = this.getEvidenceByEvidenceTypes(
      this.props.annotation.tumorTypes,
      TREATMENT_EVIDENCE_TYPES
    );
    const fdaImplications: FdaImplication[] = [];
    evidences.forEach(evidence => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const fdaLevel = levelOfEvidence2Level(evidence.fdaLevel);
      const alterations = evidence.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(this.props.refGenome)
      );
      alterations.forEach(alt => {
        // if the evidence is for Oncogenic Mutations and it's returned for the current variant,
        // that indicates the variant is oncogenic. We could convert the alteration name to the current one
        if (alt.name === ONCOGENIC_MUTATIONS) {
          if (this.props.matchedAlteration) {
            alt = this.props.matchedAlteration;
          } else {
            alt.name = alt.alteration = this.props.alteration;
          }
        }
        const ctNames = evidence.cancerTypes.map(ct =>
          getCancerTypeNameFromOncoTreeType(ct)
        );
        const excludedCtNames = evidence.excludedCancerTypes.map(ct =>
          getCancerTypeNameFromOncoTreeType(ct)
        );
        fdaImplications.push({
          level: fdaLevel,
          alteration: alt,
          alterationView: (
            <AlterationPageLink
              key={alt.name}
              hugoSymbol={this.props.hugoSymbol}
              alteration={{
                alteration: alt.alteration,
                name: alt.name,
              }}
              alterationRefGenomes={alt.referenceGenomes as REFERENCE_GENOME[]}
              hashQueries={{
                tab: ANNOTATION_PAGE_TAB_KEYS.FDA,
              }}
            />
          ),
          cancerType: getCancerTypesName(ctNames, excludedCtNames),
          cancerTypeView: (
            <>
              <WithSeparator separator={', '}>
                {ctNames.map(cancerType => (
                  <AlterationPageLink
                    key={`${this.props.alteration}-${cancerType}`}
                    hugoSymbol={this.props.hugoSymbol}
                    alteration={this.props.alteration}
                    alterationRefGenomes={[this.props.refGenome]}
                    cancerType={cancerType}
                    hashQueries={{
                      tab: ANNOTATION_PAGE_TAB_KEYS.FDA,
                    }}
                  >
                    {cancerType}
                  </AlterationPageLink>
                ))}
              </WithSeparator>
              {excludedCtNames.length > 0 ? (
                <span> (excluding {excludedCtNames.join(', ')})</span>
              ) : (
                <></>
              )}
            </>
          ),
        });
      });
    });
    return getUniqueFdaImplications(fdaImplications);
  }

  @computed
  get diagnosticImplications(): TherapeuticImplication[] {
    return this.getImplications(
      this.getEvidenceByEvidenceTypes(this.props.annotation.tumorTypes, [
        EVIDENCE_TYPES.DIAGNOSTIC_IMPLICATION,
      ])
    );
  }

  @computed
  get prognosticImplications(): TherapeuticImplication[] {
    return this.getImplications(
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
    const orderedSummaries = [SummaryKey.GENE_SUMMARY];
    if (!this.isCategoricalAlteration) {
      orderedSummaries.push(SummaryKey.ALTERATION_SUMMARY);
    }
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

  @computed get isCategoricalAlteration() {
    return isCategoricalAlteration(this.props.alteration);
  }

  @computed
  get showGeneNameLink() {
    const lHugo = this.props.hugoSymbol.toLowerCase();
    const altNameIncludesGene = this.props.alteration
      .toLowerCase()
      .includes(lHugo);
    const isOtherBiomarkers = lHugo === OTHER_BIOMARKERS.toLowerCase();
    return !altNameIncludesGene && !isOtherBiomarkers;
  }

  @computed
  get relevantBiologicalVariants(): BiologicalVariant[] {
    if (
      this.isCategoricalAlteration &&
      this.props.biologicalAlterations &&
      this.props.relevantAlterations
    ) {
      const relevantAltNames = this.props.relevantAlterations.map(
        alt => alt.alteration
      );
      return this.props.biologicalAlterations.filter(variant =>
        relevantAltNames.includes(variant.variant.alteration)
      );
    } else {
      return [];
    }
  }

  render() {
    const categoricalAlterationDescription = getCategoricalAlterationDescription(
      this.props.hugoSymbol,
      this.props.alteration,
      this.props.oncogene,
      this.props.tsg
    );
    return (
      <>
        <h2
          className={'d-flex align-items-baseline'}
          style={{ marginBottom: 0 }}
        >
          {this.showGeneNameLink && (
            <span className={'mr-2'}>
              <GenePageLink
                hugoSymbol={this.props.hugoSymbol}
                highlightContent={false}
              />
            </span>
          )}
          <span>{`${getAlterationName(
            this.props.matchedAlteration === undefined
              ? this.props.alteration
              : {
                  alteration: this.props.matchedAlteration.alteration,
                  name: this.props.matchedAlteration.name,
                },
            true
          )}`}</span>
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
            this.isCategoricalAlteration
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
          highestFdaLevel={this.props.annotation.highestFdaLevel}
        />
        <Row>
          <Col>
            {categoricalAlterationDescription && (
              <div
                className={classnames(
                  styles.categoricalAltDescription,
                  DEFAULT_MARGIN_BOTTOM_LG
                )}
              >
                {categoricalAlterationDescription}
              </div>
            )}
            {this.alterationSummaries.map(summary => {
              return (
                <div key={summary.content} className={DEFAULT_MARGIN_BOTTOM_LG}>
                  {summary.content}
                </div>
              );
            })}
            <div>
              <MutationEffectInformation
                show={this.showMutationEffect}
                mutationEffect={this.mutationEffectDescription}
                onClick={() =>
                  this.toggleMutationEffect(!this.showMutationEffect)
                }
              />
            </div>
          </Col>
        </Row>
        <Row className="mt-4">
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
        {this.props.tumorType && !this.isCategoricalAlteration ? (
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
              alteration={
                this.props.matchedAlteration
                  ? {
                      alteration: this.props.matchedAlteration.alteration,
                      name: this.props.matchedAlteration.name,
                    }
                  : {
                      alteration: this.props.alteration,
                      name: this.props.alteration,
                    }
              }
              cancerType={this.props.tumorType}
              biological={this.relevantBiologicalVariants}
              tx={this.therapeuticImplications}
              dx={this.diagnosticImplications}
              px={this.prognosticImplications}
              fda={this.fdaImplication}
              onChangeTab={this.props.onChangeTab}
            />
          </Col>
        </Row>
      </>
    );
  }
}
