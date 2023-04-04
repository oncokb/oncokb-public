import React from 'react';
import { inject, observer } from 'mobx-react';

import {
  AlterationPageLink,
  GenePageLink,
  getAlterationPageLink,
  getGenePageLink,
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
import { AlterationInfo } from 'app/pages/annotationPage/AlterationInfo';
import { Col, Row, Breadcrumb } from 'react-bootstrap';
import classnames from 'classnames';
import { action, computed, observable } from 'mobx';
import {
  BiologicalVariant,
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
import WithSeparator from 'react-with-separator';
import AppStore from 'app/store/AppStore';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';
import { Alteration } from 'app/shared/api/generated/OncoKbAPI';
import {
  getSummaries,
  getUniqueFdaImplications,
  SummaryKey,
} from 'app/pages/annotationPage/Utils';
import SummaryWithRefs from 'app/oncokb-frontend-commons/src/components/SummaryWithRefs';
import ShowHideText from 'app/shared/texts/ShowHideText';
import { Link } from 'react-router-dom';
import AlterationView from 'app/pages/annotationPage/AlterationView';
import { CancerTypeView } from 'app/pages/annotationPage/CancerTypeView';
import AuthenticationStore from 'app/store/AuthenticationStore';

export type IAnnotationPage = {
  appStore?: AppStore;
  hugoSymbol: string;
  oncogene?: boolean;
  tsg?: boolean;
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
  authenticationStore?: AuthenticationStore;
};

@inject('appStore', 'authenticationStore')
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
            {alterations.map(alteration =>
              alteration.consequence ? (
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
              ) : (
                <span>{alteration.name}</span>
              )
            )}
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
      const alterations = evidence.alterations.filter(
        alteration =>
          alteration.referenceGenomes.includes(this.props.refGenome) &&
          alteration.alteration === this.props.matchedAlteration?.alteration
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

  @computed
  get alterationSummaries() {
    const orderedSummaries = [SummaryKey.GENE_SUMMARY];
    if (!this.isCategoricalAlteration) {
      orderedSummaries.push(SummaryKey.ALTERATION_SUMMARY);
    }
    return getSummaries(this.props.annotation, orderedSummaries);
  }

  @computed get isCategoricalAlteration() {
    return isCategoricalAlteration(this.props.alteration);
  }

  @computed
  get showGeneName() {
    const lHugo = this.props.hugoSymbol.toLowerCase();
    const altNameIncludesGene = this.props.alteration
      .toLowerCase()
      .includes(lHugo);
    const isOtherBiomarkers = lHugo === OTHER_BIOMARKERS.toLowerCase();
    return !altNameIncludesGene && !isOtherBiomarkers;
  }

  @computed
  get alterationName() {
    return getAlterationName(
      this.props.matchedAlteration === undefined
        ? this.props.alteration
        : {
            alteration: this.props.matchedAlteration.alteration,
            name: this.props.matchedAlteration.name,
          },
      true
    );
  }

  getBreadcrumbItem(key: string, to: string, text: string) {
    return (
      <Breadcrumb.Item key={key} linkAs={Link} linkProps={{ to }}>
        {text}
      </Breadcrumb.Item>
    );
  }

  @computed
  get navBreadcrumbs() {
    const items = [
      this.getBreadcrumbItem(
        'gene',
        getGenePageLink({
          hugoSymbol: this.props.hugoSymbol,
        }),
        this.props.hugoSymbol
      ),
      this.getBreadcrumbItem(
        'alteration',
        getAlterationPageLink({
          hugoSymbol: this.props.hugoSymbol,
          alteration: this.alterationName,
        }),
        this.alterationName
      ),
    ];

    if (this.props.tumorType) {
      items.push(
        this.getBreadcrumbItem(
          'cancertype',
          getAlterationPageLink({
            hugoSymbol: this.props.hugoSymbol,
            alteration: this.alterationName,
            cancerType: this.props.tumorType,
          }),
          this.props.tumorType
        )
      );
    }

    return <Breadcrumb>{items}</Breadcrumb>;
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
        {this.navBreadcrumbs}
        <h2
          className={'d-flex align-items-baseline'}
          style={{ marginBottom: 0 }}
        >
          {this.showGeneName && (
            <span className={'mr-2'}>{this.props.hugoSymbol}</span>
          )}
          <span>{this.alterationName}</span>
          {this.props.tumorType && (
            <span className={'mx-2'}>in {this.props.tumorType}</span>
          )}
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
            {this.props.annotation.mutationEffect.description && (
              <ShowHideText
                show={this.showMutationEffect}
                title="mutation effect description"
                content={
                  <SummaryWithRefs
                    content={this.props.annotation.mutationEffect.description}
                    type="linkout"
                  />
                }
                onClick={() =>
                  this.toggleMutationEffect(!this.showMutationEffect)
                }
              />
            )}
          </Col>
        </Row>
        {this.props.tumorType ? (
          <CancerTypeView
            appStore={this.props.appStore}
            userAuthenticated={
              this.props.authenticationStore!.isUserAuthenticated
            }
            hugoSymbol={this.props.hugoSymbol}
            alteration={this.props.alteration}
            matchedAlteration={this.props.matchedAlteration}
            tumorType={this.props.tumorType}
            onChangeTumorType={this.props.onChangeTumorType}
            annotation={this.props.annotation}
            biologicalAlterations={this.props.biologicalAlterations}
            relevantAlterations={this.props.relevantAlterations}
            fdaImplication={this.fdaImplication}
            therapeuticImplications={this.therapeuticImplications}
            diagnosticImplications={this.diagnosticImplications}
            prognosticImplications={this.prognosticImplications}
            defaultSelectedTab={this.props.defaultSelectedTab}
            onChangeTab={this.props.onChangeTab}
          />
        ) : (
          <AlterationView
            appStore={this.props.appStore}
            hugoSymbol={this.props.hugoSymbol}
            alteration={this.props.alteration}
            matchedAlteration={this.props.matchedAlteration}
            tumorType={this.props.tumorType}
            onChangeTumorType={this.props.onChangeTumorType}
            annotation={this.props.annotation}
            biologicalAlterations={this.props.biologicalAlterations}
            relevantAlterations={this.props.relevantAlterations}
            fdaImplication={this.fdaImplication}
            therapeuticImplications={this.therapeuticImplications}
            diagnosticImplications={this.diagnosticImplications}
            prognosticImplications={this.prognosticImplications}
            defaultSelectedTab={this.props.defaultSelectedTab}
            onChangeTab={this.props.onChangeTab}
          />
        )}
      </>
    );
  }
}
