import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  AnnotationStore,
  TherapeuticImplication,
  FdaImplication,
} from 'app/store/AnnotationStore';
import { AnnotationType } from '../annotationPage/AnnotationPage';
import { RouteComponentProps } from 'react-router';
import * as QueryString from 'query-string';
import {
  decodeSlash,
  getPageTitle,
  levelOfEvidence2Level,
  getCancerTypeNameFromOncoTreeType,
  getCancerTypesName,
  getTreatmentNameByPriority,
  articles2Citations,
  isCategoricalAlteration,
  citationsHasInfo,
  isPositionalAlteration,
  OncoKBOncogenicityIcon,
} from 'app/shared/utils/Utils';
import {
  getAlterationPageLink,
  parseAlterationPagePath,
  getGenePageLink,
  AlterationPageLink,
} from 'app/shared/utils/UrlUtils';
import { computed, reaction, action, observable } from 'mobx';
import { GENETIC_TYPE } from 'app/components/geneticTypeTabs/GeneticTypeTabs';
import { observer, inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import styles from './SomaticGermlineAlterationPage.module.scss';
import classNames from 'classnames';
import StickyMiniNavBar, {
  StickyMiniNavBarContextProvider,
} from 'app/shared/nav/StickyMiniNavBar';
import AlterationView from '../annotationPage/AlterationView';
import AppStore from 'app/store/AppStore';
import ShowHideText from 'app/shared/texts/ShowHideText';
import { Col, Alert } from 'reactstrap';
import { Row, Container } from 'react-bootstrap';
import { CancerTypeView } from '../annotationPage/CancerTypeView';
import WindowStore from 'app/store/WindowStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import {
  EVIDENCE_TYPES,
  REFERENCE_GENOME,
  ANNOTATION_PAGE_TAB_KEYS,
  TREATMENT_EVIDENCE_TYPES,
  ONCOKB_TM,
  MUTATION_EFFECT,
  ONCOGENICITY,
} from 'app/config/constants';
import {
  Alteration,
  MutationEffectResp,
} from 'app/shared/api/generated/OncoKbAPI';
import {
  Evidence,
  VariantAnnotationTumorType,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import WithSeparator from 'react-with-separator';
import { uniqBy, upperFirst } from 'app/shared/utils/LodashUtils';
import {
  SummaryKey,
  getSummaries,
  getUniqueFdaImplications,
} from '../annotationPage/Utils';
import autobind from 'autobind-decorator';
import { AlterationPageHashQueries } from 'app/shared/route/types';
import MutationEffectDescription from '../annotationPage/MutationEffectDescription';
import MiniNavBarHeader from 'app/shared/nav/MiniNavBarHeader';
import AlterationTile from './AlterationTile';
import HighestLevelEvidence from './HighestLevelEvidence';
import { GenomicIndicatorTable } from '../genePage/GenomicIndicatorTable';
import { Else, If, Then } from 'react-if';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { FeedbackType } from 'app/components/feedback/types';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { CitationTooltip } from 'app/components/CitationTooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import {
  COLOR_ICON_WITH_INFO,
  COLOR_ICON_WITHOUT_INFO,
} from 'app/config/theme';
import SomaticGermlineAlterationView from '../annotationPage/SomaticGermlineAlterationView';
import {
  ITextBreadcrumb,
  ILinkBreadcrumb,
  IDropdownBreadcrumb,
  IInputBreadcrumb,
  AnnotationBreadcrumbs,
} from '../annotationPage/AnnotationBreadcrumbs';

function OncogenicInfo({
  isUnknownOncogenicity,
  isVus,
  oncogenicity,
}: {
  isUnknownOncogenicity: boolean;
  oncogenicity: string | undefined;
  isVus: boolean;
}) {
  return (
    <span className="h5 d-flex">
      <span>
        {isUnknownOncogenicity
          ? `${ONCOGENICITY.UNKNOWN} Oncogenic Effect`
          : oncogenicity}
      </span>
      <OncoKBOncogenicityIcon oncogenicity={oncogenicity} isVus={isVus} />
    </span>
  );
}

function MutationEffectIcon({
  mutationEffect,
}: {
  mutationEffect: MutationEffectResp;
}) {
  const hasCitations = citationsHasInfo(mutationEffect.citations);
  const tooltipOverlay = () => (
    <CitationTooltip
      pmids={mutationEffect.citations.pmids}
      abstracts={mutationEffect.citations.abstracts}
    />
  );
  return (
    <span className="h5">
      <span>
        {mutationEffect.knownEffect === MUTATION_EFFECT.UNKNOWN
          ? `${MUTATION_EFFECT.UNKNOWN} Biological Effect`
          : mutationEffect.knownEffect}
      </span>
      {hasCitations ? (
        <DefaultTooltip overlay={tooltipOverlay} key="mutationEffectTooltip">
          <i
            className="fa fa-book mx-1"
            style={{
              fontSize: '0.8em',
              color: hasCitations
                ? COLOR_ICON_WITH_INFO
                : COLOR_ICON_WITHOUT_INFO,
            }}
          ></i>
        </DefaultTooltip>
      ) : null}
    </span>
  );
}

type MatchParams = {
  hugoSymbol: string;
  alteration: string;
};

type SomaticGermlineAlterationPageProps = {
  appStore: AppStore;
  windowStore: WindowStore;
  authenticationStore: AuthenticationStore;
} & RouteComponentProps<MatchParams>;

type SomaticGermlineAlterationPageState = {};

@inject('appStore', 'windowStore', 'authenticationStore')
@observer
export class SomaticGermlineAlterationPage extends React.Component<
  SomaticGermlineAlterationPageProps,
  SomaticGermlineAlterationPageState
> {
  private store: AnnotationStore;
  private selectedTab: ANNOTATION_PAGE_TAB_KEYS;

  @observable showMutationEffect = true;

  constructor(props: SomaticGermlineAlterationPageProps) {
    super(props);
    const alterationQuery = decodeSlash(props.match.params.alteration);
    reaction(
      () => [this.geneticType],
      ([geneticType]) => {
        if (props.match.params) {
          this.store = new AnnotationStore({
            type: alterationQuery
              ? AnnotationType.PROTEIN_CHANGE
              : AnnotationType.GENE,
            hugoSymbolQuery: props.match.params.hugoSymbol,
            alterationQuery,
            germline: geneticType === GENETIC_TYPE.GERMLINE,
          });
          if (this.store.cancerTypeName) {
            this.showMutationEffect = false;
          }
        }
      },
      true
    );
    reaction(
      () => [props.location.hash],
      ([hash]) => {
        const queryStrings = QueryString.parse(
          hash
        ) as AlterationPageHashQueries;
        if (queryStrings.tab) {
          this.selectedTab = queryStrings.tab;
          if (queryStrings.tab === ANNOTATION_PAGE_TAB_KEYS.FDA) {
            this.props.appStore.inFdaRecognizedContent = true;
          }
        }
      },
      true
    );
  }

  @action.bound
  toggleMutationEffect(value: boolean) {
    this.showMutationEffect = value;
  }

  @computed
  get pageShouldBeRendered() {
    return (
      this.store.gene.isComplete &&
      this.store.geneNumber.isComplete &&
      this.store.ensemblGenes.isComplete &&
      this.store.clinicalAlterations.isComplete &&
      this.store.biologicalAlterations.isComplete &&
      this.store.annotationData.isComplete
    );
  }

  @computed
  get errorOccurred() {
    return (
      this.store.gene.isError ||
      this.store.geneNumber.isError ||
      this.store.ensemblGenes.isError ||
      this.store.clinicalAlterations.isError ||
      this.store.biologicalAlterations.isError ||
      this.store.annotationData.isError
    );
  }

  @computed
  get documentTitle() {
    const content = [];
    if (this.store.hugoSymbol) {
      content.push(this.store.hugoSymbol);
    }
    if (this.store.alterationQuery) {
      content.push(this.store.alterationQuery);
    }
    if (this.store.tumorTypeQuery) {
      content.push(`in ${this.store.cancerTypeName}`);
    }
    return getPageTitle(content.join(' '));
  }

  @computed
  get geneticType() {
    const { geneticType } = parseAlterationPagePath(
      this.props.location.pathname
    );
    return geneticType ?? GENETIC_TYPE.SOMATIC;
  }

  onChangeTumorType(newTumorType: string) {
    this.store.tumorTypeQuery = newTumorType;
  }

  getImplications(evidences: Evidence[]) {
    return evidences.reduce((acc, evidence) => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const fdaLevel = levelOfEvidence2Level(evidence.fdaLevel);
      const alterations = evidence.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(this.store.referenceGenomeQuery)
      );
      const alterationsName = alterations
        .map(alteration => alteration.name)
        .join(', ');
      const cancerTypes = evidence.cancerTypes.map(cancerType =>
        getCancerTypeNameFromOncoTreeType(cancerType)
      );
      const excludedCancerTypes = evidence.excludedCancerTypes.map(ct =>
        getCancerTypeNameFromOncoTreeType(ct)
      );
      const cancerTypesName = getCancerTypesName(
        cancerTypes,
        excludedCancerTypes
      );
      if (evidence.treatments.length > 0) {
        evidence.treatments.forEach(treatment => {
          acc.push({
            level,
            fdaLevel,
            drugDescription: evidence.description,
            alterations: alterationsName,
            alterationsView: (
              <WithSeparator separator={', '}>
                {alterations.map(alteration =>
                  alteration.consequence ? (
                    <AlterationPageLink
                      key={alteration.name}
                      hugoSymbol={this.store.hugoSymbol}
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
            drugs: getTreatmentNameByPriority(treatment),
            cancerTypes: cancerTypesName,
            cancerTypesView: (
              <>
                <WithSeparator separator={', '}>
                  {cancerTypes.map(cancerType => (
                    <AlterationPageLink
                      key={`${this.store.alterationName}-${cancerType}`}
                      hugoSymbol={this.store.hugoSymbol}
                      alteration={this.store.alterationName}
                      alterationRefGenomes={[this.store.referenceGenomeQuery]}
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
          } as TherapeuticImplication);
        });
      } else {
        acc.push({
          level,
          fdaLevel,
          drugDescription: evidence.description,
          alterations: alterationsName,
          alterationsView: (
            <WithSeparator separator={', '}>
              {alterations.map(alteration =>
                alteration.consequence ? (
                  <AlterationPageLink
                    key={alteration.name}
                    hugoSymbol={this.store.hugoSymbol}
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
          drugs: '',
          cancerTypes: cancerTypesName,
          cancerTypesView: (
            <>
              <WithSeparator separator={', '}>
                {cancerTypes.map(cancerType => (
                  <AlterationPageLink
                    key={`${this.store.alterationName}-${cancerType}`}
                    hugoSymbol={this.store.hugoSymbol}
                    alteration={this.store.alterationName}
                    alterationRefGenomes={[this.store.referenceGenomeQuery]}
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
        } as TherapeuticImplication);
      }
      return acc;
    }, [] as TherapeuticImplication[]);
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

    return uniqBy(uniqueEvidences, evidence => evidence.id);
  }

  @computed
  get therapeuticImplications(): TherapeuticImplication[] {
    return this.getImplications(
      this.getEvidenceByEvidenceTypes(
        this.store.annotationData.result.tumorTypes,
        TREATMENT_EVIDENCE_TYPES
      )
    );
  }

  @computed
  get fdaImplication(): FdaImplication[] {
    const evidences = this.getEvidenceByEvidenceTypes(
      this.store.annotationData.result.tumorTypes,
      TREATMENT_EVIDENCE_TYPES
    );
    const fdaImplications: FdaImplication[] = [];
    evidences.forEach(evidence => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const fdaLevel = levelOfEvidence2Level(evidence.fdaLevel);
      const alterations = evidence.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(this.store.referenceGenomeQuery)
      );
      alterations.forEach(alt => {
        // convert all alterations to matchedAlteration/alteration query if not positional variant
        let mappedAlteration = {} as Alteration;
        if (
          this.store.relevantAlterations.result
            .map(relevantAlt => relevantAlt.alteration)
            .includes(alt.alteration)
        ) {
          mappedAlteration = alt;
        } else {
          if (this.store.alteration.result) {
            mappedAlteration = this.store.alteration.result;
          } else {
            mappedAlteration.name = mappedAlteration.alteration = this.store.alterationName;
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
          alteration: mappedAlteration,
          alterationView: (
            <AlterationPageLink
              key={mappedAlteration.name}
              hugoSymbol={this.store.hugoSymbol}
              alteration={{
                alteration: mappedAlteration.alteration,
                name: mappedAlteration.name,
              }}
              alterationRefGenomes={
                mappedAlteration.referenceGenomes as REFERENCE_GENOME[]
              }
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
                    key={`${this.store.alterationName}-${cancerType}`}
                    hugoSymbol={this.store.hugoSymbol}
                    alteration={this.store.alterationName}
                    alterationRefGenomes={[this.store.referenceGenomeQuery]}
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
      this.getEvidenceByEvidenceTypes(
        this.store.annotationData.result.tumorTypes,
        [EVIDENCE_TYPES.DIAGNOSTIC_IMPLICATION]
      )
    );
  }

  @computed
  get prognosticImplications(): TherapeuticImplication[] {
    return this.getImplications(
      this.getEvidenceByEvidenceTypes(
        this.store.annotationData.result.tumorTypes,
        [EVIDENCE_TYPES.PROGNOSTIC_IMPLICATION]
      )
    );
  }

  @computed
  get alterationSummaries() {
    const orderedSummaries = [SummaryKey.GENE_SUMMARY];
    if (!this.isCategoricalAlteration) {
      orderedSummaries.push(SummaryKey.ALTERATION_SUMMARY);
    }
    return getSummaries(this.store.annotationData.result, orderedSummaries);
  }

  @computed get isCategoricalAlteration() {
    return isCategoricalAlteration(this.store.alterationName);
  }

  @autobind
  onChangeTab(
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) {
    if (newTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA) {
      this.props.appStore.inFdaRecognizedContent = true;
    }
    if (
      selectedTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA &&
      newTabKey !== ANNOTATION_PAGE_TAB_KEYS.FDA
    ) {
      this.props.appStore.showFdaModal = true;
    } else {
      const newHash: AlterationPageHashQueries = { tab: newTabKey };
      window.location.hash = QueryString.stringify(newHash);
    }
    this.selectedTab = newTabKey;
  }

  @computed
  get isPositionalAlteration() {
    return isPositionalAlteration(
      this.store.annotationData.result.query.proteinStart,
      this.store.annotationData.result.query.proteinEnd,
      this.store.annotationData.result.query.consequence
    );
  }

  get isUnknownOncogenicity() {
    return (
      !this.store.annotationData.result.oncogenic ||
      this.store.annotationData.result.oncogenic === ONCOGENICITY.UNKNOWN
    );
  }

  createHeader(includeEmailLink: boolean) {
    return (
      <div className={classNames(styles.headerContent)}>
        {this.store.hugoSymbol} {this.store.alterationNameWithDiff}{' '}
        <span className={classNames(styles.pill)}>
          {upperFirst(this.geneticType)}
        </span>
        <span style={{ fontSize: '0.5em' }} className={'ml-2'}>
          {includeEmailLink && (
            <FeedbackIcon
              feedback={{
                type: FeedbackType.ANNOTATION,
                annotation: {
                  gene: this.store.hugoSymbol,
                  alteration: this.store.alterationName,
                  cancerType: this.store.cancerTypeName,
                },
              }}
              appStore={this.props.appStore}
            />
          )}
        </span>
      </div>
    );
  }

  @computed
  get navBreadcrumbs() {
    const breadcrumbs: (
      | ITextBreadcrumb
      | ILinkBreadcrumb
      | IDropdownBreadcrumb
      | IInputBreadcrumb
    )[] = [
      {
        type: 'link',
        key: 'gene',
        text: this.store.hugoSymbol,
        to: getGenePageLink({
          hugoSymbol: this.store.hugoSymbol,
        }),
      } as ILinkBreadcrumb,
      {
        type: 'link',
        key: 'alteration',
        text: this.store.alterationNameWithDiff,
        to: getAlterationPageLink({
          hugoSymbol: this.store.hugoSymbol,
          alteration: this.store.alterationName,
        }),
      } as ILinkBreadcrumb,
    ];

    if (this.store.cancerTypeName) {
      breadcrumbs.push({
        type: 'text',
        text: this.store.cancerTypeName,
        key: 'cancertype',
      } as ITextBreadcrumb);
    }

    return <AnnotationBreadcrumbs breadcrumbs={breadcrumbs} />;
  }

  render() {
    return (
      <>
        <Helmet>
          <title>{this.documentTitle}</title>
          <link
            id="canonical"
            rel="canonical"
            href={getAlterationPageLink({
              hugoSymbol: this.store.hugoSymbol,
              alteration: this.store.alterationQuery,
              cancerType: this.store.cancerTypeName,
              withProtocolHostPrefix: true,
            })}
          />
        </Helmet>
        {this.pageShouldBeRendered ? (
          <StickyMiniNavBarContextProvider>
            <Container>
              <Row className="justify-content-center">
                <Col md={11}>
                  {this.navBreadcrumbs}
                  <h1 className={classNames(styles.header)}>
                    {this.createHeader(true)}
                  </h1>
                </Col>
                <Col md={11}>
                  <Row className={classNames(styles.descriptionContainer)}>
                    <Col>
                      <MiniNavBarHeader id="variant-overview" className="">
                        Variant Overview
                      </MiniNavBarHeader>
                      {this.store.annotationData.result.background}
                    </Col>
                  </Row>
                  {this.store.annotationData.result.mutationEffect
                    .description && (
                    <Row className={classNames(styles.descriptionContainer)}>
                      <Col>
                        <ShowHideText
                          show={this.showMutationEffect}
                          title="mutation effect description"
                          content={
                            <MutationEffectDescription
                              hugoSymbol={this.store.hugoSymbol}
                              description={
                                this.store.annotationData.result.mutationEffect
                                  .description
                              }
                            />
                          }
                          onClick={() =>
                            this.toggleMutationEffect(!this.showMutationEffect)
                          }
                        />
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            </Container>
            <StickyMiniNavBar
              title={
                <div className={classNames(styles.navBarTitle)}>
                  {this.createHeader(false)}
                </div>
              }
            />
            <Container>
              <Row className="justify-content-center">
                <Col md={11}>
                  <div className={classNames(styles.alterationTiles)}>
                    {this.store.germline ? (
                      <>
                        <AlterationTile
                          title="Pathogenicity"
                          items={[
                            {
                              title: ONCOKB_TM,
                              value: this.store.annotationData.result.germline
                                .pathogenic,
                            },
                            {
                              title: 'Clinvar',
                              value: 'Conflicting Classification',
                              link: '#',
                            },
                          ]}
                        />
                        <AlterationTile
                          title="Genetic Risk"
                          items={[
                            {
                              title: 'Penetrance',
                              value: this.store.geneNumber.result.penetrance,
                            },
                            {
                              title: 'Inheritance',
                              value: this.store.geneNumber.result
                                .inheritanceMechanism,
                            },
                          ]}
                        />
                      </>
                    ) : (
                      <>
                        <AlterationTile
                          title="Mutation Effect"
                          items={[
                            {
                              title: 'Oncogenicity',
                              show:
                                !this.isUnknownOncogenicity ||
                                !this.isPositionalAlteration,

                              value: (
                                <OncogenicInfo
                                  oncogenicity={
                                    this.store.annotationData.result.oncogenic
                                  }
                                  isVus={this.store.annotationData.result.vus}
                                  isUnknownOncogenicity={
                                    this.isUnknownOncogenicity
                                  }
                                />
                              ),
                            },
                            {
                              title: 'Biological Effect',
                              show:
                                this.store.annotationData.result
                                  .mutationEffect &&
                                (this.store.annotationData.result.mutationEffect
                                  .knownEffect !== MUTATION_EFFECT.UNKNOWN ||
                                  this.isPositionalAlteration),
                              value: (
                                <MutationEffectIcon
                                  mutationEffect={
                                    this.store.annotationData.result
                                      .mutationEffect
                                  }
                                />
                              ),
                            },
                          ]}
                        />
                        <AlterationTile
                          title="Highest level of evidence"
                          items={[
                            [
                              {
                                title: 'Therapeutic',
                                show:
                                  !!this.store.geneNumber.result
                                    .highestSensitiveLevel ||
                                  !!this.store.geneNumber.result
                                    .highestResistanceLevel,
                                value: (
                                  <div
                                    className={classNames('d-flex', 'flex-row')}
                                  >
                                    <HighestLevelEvidence
                                      type="Sensitive"
                                      level={
                                        this.store.geneNumber.result
                                          .highestSensitiveLevel
                                      }
                                    />
                                    <HighestLevelEvidence
                                      type="Resistance"
                                      level={
                                        this.store.geneNumber.result
                                          .highestResistanceLevel
                                      }
                                    />
                                  </div>
                                ),
                              },
                              {
                                title: 'Diagnostic',
                                show: !!this.store.geneNumber.result
                                  .highestDiagnosticImplicationLevel,
                                value: (
                                  <HighestLevelEvidence
                                    type="DiagnosticImplication"
                                    level={
                                      this.store.geneNumber.result
                                        .highestDiagnosticImplicationLevel
                                    }
                                  />
                                ),
                              },
                            ],
                            [
                              {
                                title: 'Prognostic',
                                show: !!this.store.geneNumber.result
                                  .highestPrognosticImplicationLevel,
                                value: (
                                  <HighestLevelEvidence
                                    type="PrognosticImplication"
                                    level={
                                      this.store.geneNumber.result
                                        .highestPrognosticImplicationLevel
                                    }
                                  />
                                ),
                              },
                              {
                                title: 'FDA',
                                show: !!this.store.geneNumber.result
                                  .highestFdaLevel,
                                value: (
                                  <HighestLevelEvidence
                                    type="Fda"
                                    level={
                                      this.store.geneNumber.result
                                        .highestFdaLevel
                                    }
                                  />
                                ),
                              },
                            ],
                          ]}
                        />
                      </>
                    )}
                  </div>
                </Col>
              </Row>
              <Row className="justify-content-center">
                <Col md={11}>
                  {this.store.germline &&
                    (this.store.genomicIndicators.isPending ||
                      this.store.genomicIndicators.result.length > 0) && (
                      <>
                        <MiniNavBarHeader id="genomic-indicators">
                          Genomic Indicators
                        </MiniNavBarHeader>
                        <GenomicIndicatorTable
                          data={this.store.genomicIndicators.result}
                          isPending={this.store.genomicIndicators.isPending}
                        />
                      </>
                    )}
                  <MiniNavBarHeader id="clinical-implications">
                    Clinical Implications For This Biomarker
                  </MiniNavBarHeader>
                  {this.store.cancerTypeName ? (
                    <CancerTypeView
                      appStore={this.props.appStore}
                      isLargeScreen={this.props.windowStore.isLargeScreen}
                      userAuthenticated={
                        this.props.authenticationStore.isUserAuthenticated
                      }
                      hugoSymbol={this.store.hugoSymbol}
                      alteration={this.store.alterationName}
                      matchedAlteration={this.store.alteration.result}
                      tumorType={this.store.cancerTypeName}
                      onChangeTumorType={this.onChangeTumorType.bind(this)}
                      annotation={this.store.annotationData.result}
                      biologicalAlterations={
                        this.store.biologicalAlterations.result
                      }
                      relevantAlterations={undefined}
                      fdaImplication={this.fdaImplication}
                      therapeuticImplications={this.therapeuticImplications}
                      diagnosticImplications={this.diagnosticImplications}
                      prognosticImplications={this.prognosticImplications}
                      defaultSelectedTab={this.selectedTab}
                      onChangeTab={this.onChangeTab}
                    />
                  ) : (
                    <SomaticGermlineAlterationView
                      appStore={this.props.appStore}
                      hugoSymbol={this.store.hugoSymbol}
                      alteration={this.store.alterationName}
                      matchedAlteration={this.store.alteration.result}
                      tumorType={this.store.cancerTypeName}
                      onChangeTumorType={this.onChangeTumorType.bind(this)}
                      annotation={this.store.annotationData.result}
                      biologicalAlterations={
                        this.store.biologicalAlterations.result
                      }
                      relevantAlterations={undefined}
                      fdaImplication={this.fdaImplication}
                      therapeuticImplications={this.therapeuticImplications}
                      diagnosticImplications={this.diagnosticImplications}
                      prognosticImplications={this.prognosticImplications}
                      defaultSelectedTab={this.selectedTab}
                      onChangeTab={this.onChangeTab}
                    />
                  )}
                </Col>
              </Row>
            </Container>
          </StickyMiniNavBarContextProvider>
        ) : (
          <If condition={this.errorOccurred}>
            <Then>
              <Alert variant="warning" className={'text-center'}>
                An error occurred while annotating your variant.
              </Alert>
            </Then>
            <Else>
              <LoadingIndicator
                size={LoaderSize.LARGE}
                center={true}
                isLoading={true}
              />
            </Else>
          </If>
        )}
      </>
    );
  }
}
