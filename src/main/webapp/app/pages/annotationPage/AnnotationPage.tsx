import React from 'react';
import { observer } from 'mobx-react';

import {
  AlterationPageLink,
  getGenomicPageLink,
  getGenomicPageLocation,
} from 'app/shared/utils/UrlUtils';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_GENE,
  EVIDENCE_TYPES,
  OTHER_BIOMARKERS,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  TREATMENT_EVIDENCE_TYPES,
} from 'app/config/constants';
import styles from 'app/pages/alterationPage/AlterationPage.module.scss';
import { Col, Row, Alert } from 'react-bootstrap';
import classnames from 'classnames';
import { action, computed, observable } from 'mobx';
import * as QueryString from 'querystring';
import {
  Evidence,
  VariantAnnotationTumorType,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  AnnotationStore,
  FdaImplication,
  TherapeuticImplication,
} from 'app/store/AnnotationStore';
import {
  articles2Citations,
  getCancerTypeNameFromOncoTreeType,
  getCancerTypesName,
  getTreatmentNameByPriority,
  isCategoricalAlteration,
  levelOfEvidence2Level,
} from 'app/shared/utils/Utils';
import WithSeparator from 'react-with-separator';
import AppStore from 'app/store/AppStore';
import { Alteration } from 'app/shared/api/generated/OncoKbAPI';
import {
  getSummaries,
  getUniqueFdaImplications,
  SummaryKey,
} from 'app/pages/annotationPage/Utils';
import ShowHideText from 'app/shared/texts/ShowHideText';
import { CancerTypeView } from 'app/pages/annotationPage/CancerTypeView';
import AuthenticationStore from 'app/store/AuthenticationStore';
import WindowStore from 'app/store/WindowStore';

import gnLogo from 'content/images/gn_logo.png';
import revueLogo from 'content/images/revue_logo.png';
import { PowerBySource } from 'app/pages/annotationPage/PowerBySource';
import {
  AnnotationBreadcrumbs,
  IDropdownBreadcrumb,
  IInputBreadcrumb,
  ILinkBreadcrumb,
  ITextBreadcrumb,
} from 'app/pages/annotationPage/AnnotationBreadcrumbs';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { Else, If, Then } from 'react-if';
import { UnknownGeneAlert } from 'app/shared/alert/UnknownGeneAlert';
import { RouterStore } from 'mobx-react-router';
import { Option } from 'app/shared/select/FormSelectWithLabelField';
import MutationEffectDescription from 'app/pages/annotationPage/MutationEffectDescription';
import { uniqBy } from 'app/shared/utils/LodashUtils';
import { Helmet } from 'react-helmet-async';
import SomaticGermlineAlterationView from './SomaticGermlineAlterationView';
import VariantOverView from 'app/shared/sections/VariantOverview';
import GermlineSomaticHeader from 'app/shared/header/GermlineSomaticHeader';
import GeneAdditionalInfoSection from 'app/shared/sections/GeneAdditionalInfoSection';
import { SomaticGermlineAlterationTiles } from 'app/shared/tiles/tile-utils';
import MiniNavBarHeader from 'app/shared/nav/MiniNavBarHeader';
import { StickyMiniNavBarContextProvider } from 'app/shared/nav/StickyMiniNavBar';
import SomaticGermlineCancerTypeSelect from 'app/shared/dropdown/SomaticGermlineCancerTypeSelect';
import { COLOR_BLUE } from 'app/config/theme';

export enum AnnotationType {
  GENE,
  PROTEIN_CHANGE,
  HGVSG,
  GENOMIC_CHANGE,
}

export type IAnnotationPage = {
  routing: RouterStore;
  appStore: AppStore;
  windowStore: WindowStore;
  store: AnnotationStore;
  annotationType: AnnotationType;
  onChangeTumorType: (newTumorType: string) => void;
  relevantAlterations?: Alteration[];
  defaultSelectedTab?: ANNOTATION_PAGE_TAB_KEYS;
  onChangeTab?: (
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) => void;
  authenticationStore: AuthenticationStore;
};

@observer
export default class AnnotationPage extends React.Component<
  IAnnotationPage,
  {}
> {
  @observable showMutationEffect = true;
  @observable showAdditionalGeneInfo = false;

  constructor(props: any) {
    super(props);
  }

  @action.bound
  toggleMutationEffect(value: boolean) {
    this.showMutationEffect = value;
  }

  @action.bound
  toggleAdditionalGeneInfo() {
    this.showAdditionalGeneInfo = !this.showAdditionalGeneInfo;
  }

  getImplications(evidences: Evidence[]) {
    return evidences.reduce((acc, evidence) => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const fdaLevel = levelOfEvidence2Level(evidence.fdaLevel);
      const alterations = evidence.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(
          this.props.store.referenceGenomeQuery
        )
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
                      hugoSymbol={this.props.store.hugoSymbol}
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
            cancerTypesArray: cancerTypes,
            cancerTypesView: (
              <>
                <WithSeparator separator={', '}>
                  {cancerTypes.map(cancerType => (
                    <AlterationPageLink
                      key={`${this.props.store.alterationName}-${cancerType}`}
                      hugoSymbol={this.props.store.hugoSymbol}
                      alteration={this.props.store.alterationName}
                      alterationRefGenomes={[
                        this.props.store.referenceGenomeQuery,
                      ]}
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
                    hugoSymbol={this.props.store.hugoSymbol}
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
          cancerTypesArray: cancerTypes,
          cancerTypesView: (
            <>
              <WithSeparator separator={', '}>
                {cancerTypes.map(cancerType => (
                  <AlterationPageLink
                    key={`${this.props.store.alterationName}-${cancerType}`}
                    hugoSymbol={this.props.store.hugoSymbol}
                    alteration={this.props.store.alterationName}
                    alterationRefGenomes={[
                      this.props.store.referenceGenomeQuery,
                    ]}
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
        this.props.store.annotationData.result.tumorTypes,
        TREATMENT_EVIDENCE_TYPES
      )
    );
  }

  @computed
  get fdaImplication(): FdaImplication[] {
    const evidences = this.getEvidenceByEvidenceTypes(
      this.props.store.annotationData.result.tumorTypes,
      TREATMENT_EVIDENCE_TYPES
    );
    const fdaImplications: FdaImplication[] = [];
    evidences.forEach(evidence => {
      const level = levelOfEvidence2Level(evidence.levelOfEvidence);
      const fdaLevel = levelOfEvidence2Level(evidence.fdaLevel);
      const alterations = evidence.alterations.filter(alteration =>
        alteration.referenceGenomes.includes(
          this.props.store.referenceGenomeQuery
        )
      );
      alterations.forEach(alt => {
        // convert all alterations to matchedAlteration/alteration query if not positional variant
        let mappedAlteration = {} as Alteration;
        if (
          this.props.store.relevantAlterations.result
            .map(relevantAlt => relevantAlt.alteration)
            .includes(alt.alteration)
        ) {
          mappedAlteration = alt;
        } else {
          if (this.props.store.alteration) {
            mappedAlteration = this.props.store.alteration;
          } else {
            mappedAlteration.name = mappedAlteration.alteration = this.props.store.alterationName;
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
              hugoSymbol={this.props.store.hugoSymbol}
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
                    key={`${this.props.store.alterationName}-${cancerType}`}
                    hugoSymbol={this.props.store.hugoSymbol}
                    alteration={this.props.store.alterationName}
                    alterationRefGenomes={[
                      this.props.store.referenceGenomeQuery,
                    ]}
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
        this.props.store.annotationData.result.tumorTypes,
        [EVIDENCE_TYPES.DIAGNOSTIC_IMPLICATION]
      )
    );
  }

  @computed
  get prognosticImplications(): TherapeuticImplication[] {
    return this.getImplications(
      this.getEvidenceByEvidenceTypes(
        this.props.store.annotationData.result.tumorTypes,
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
    return getSummaries(
      this.props.store.annotationData.result,
      orderedSummaries
    );
  }

  @computed get isCategoricalAlteration() {
    return isCategoricalAlteration(this.props.store.alterationName);
  }

  @computed
  get pageShouldBeRendered() {
    if (this.props.annotationType === AnnotationType.PROTEIN_CHANGE) {
      return (
        this.props.store.gene.isComplete &&
        this.props.store.geneNumber.isComplete &&
        this.props.store.ensemblGenes.isComplete &&
        this.props.store.clinicalAlterations.isComplete &&
        this.props.store.biologicalAlterations.isComplete &&
        this.props.store.annotationData.isComplete
      );
    } else {
      return this.props.store.annotationData.isComplete;
    }
  }

  @computed
  get annotationPageMetaDescription() {
    if (this.pageShouldBeRendered) {
      return `${this.props.store.annotationData.result.geneSummary} ${this.props.store.annotationData.result.variantSummary} ${this.props.store.annotationData.result.tumorTypeSummary}`;
    } else {
      return '';
    }
  }

  @computed
  get navBreadcrumbs() {
    let breadcrumbs: (
      | ITextBreadcrumb
      | ILinkBreadcrumb
      | IDropdownBreadcrumb
      | IInputBreadcrumb
    )[] = [];
    switch (this.props.annotationType) {
      case AnnotationType.HGVSG:
        breadcrumbs = [
          {
            type: 'dropdown',
            key: 'referenceGenome',
            text: this.props.store.referenceGenomeQuery,
            onChange: (selectedOption: Option) => {
              this.props.routing.history.push(
                getGenomicPageLink({
                  rootRoute: PAGE_ROUTE.HGVSG,
                  query: this.props.store.hgvsgQuery,
                  refGenome: selectedOption.value as REFERENCE_GENOME,
                  cancerType: this.props.store.cancerTypeName,
                })
              );
            },
            options: [REFERENCE_GENOME.GRCh37, REFERENCE_GENOME.GRCh38],
          } as IDropdownBreadcrumb,
          {
            type: 'input',
            key: 'hgvsg',
            text: this.props.store.hgvsgQuery,
            onChange: (newQuery: string) => {
              const location = getGenomicPageLocation({
                rootRoute: PAGE_ROUTE.HGVSG,
                query: newQuery,
                refGenome: this.props.store.referenceGenomeQuery,
                cancerType: this.props.store.cancerTypeName,
              });
              window.location.search = QueryString.stringify(location.search);
              window.location.pathname = location.pathname;
            },
          } as IInputBreadcrumb,
        ];
        break;
      case AnnotationType.GENOMIC_CHANGE:
        breadcrumbs = [
          {
            type: 'dropdown',
            key: 'referenceGenome',
            text: this.props.store.referenceGenomeQuery,
            onChange: (selectedOption: Option) => {
              this.props.routing.history.push(
                getGenomicPageLink({
                  rootRoute: PAGE_ROUTE.GENOMIC_CHANGE,
                  query: this.props.store.genomicChangeQuery,
                  refGenome: selectedOption.value as REFERENCE_GENOME,
                  cancerType: this.props.store.cancerTypeName,
                })
              );
            },
            options: [REFERENCE_GENOME.GRCh37, REFERENCE_GENOME.GRCh38],
          } as IDropdownBreadcrumb,
          {
            type: 'input',
            key: 'genomicChange',
            text: this.props.store.genomicChangeQuery,
            onChange: (newQuery: string) => {
              const location = getGenomicPageLocation({
                rootRoute: PAGE_ROUTE.GENOMIC_CHANGE,
                query: newQuery,
                refGenome: this.props.store.referenceGenomeQuery,
                cancerType: this.props.store.cancerTypeName,
              });
              window.location.search = QueryString.stringify(location.search);
              window.location.pathname = location.pathname;
            },
          } as IInputBreadcrumb,
        ];
        break;
      default:
        break;
    }

    if (this.props.store.cancerTypeName) {
      breadcrumbs.push({
        type: 'text',
        text: this.props.store.cancerTypeName,
        key: 'cancertype',
      } as ITextBreadcrumb);
    }

    return <AnnotationBreadcrumbs breadcrumbs={breadcrumbs} />;
  }

  getAnnotationComponents() {
    return (
      <>
        <Helmet>
          <meta
            name="description"
            content={this.annotationPageMetaDescription}
          />
        </Helmet>
        <StickyMiniNavBarContextProvider>
          <Row className="align-items-start">
            <Col className="flex-grow-1">
              <GermlineSomaticHeader
                includeEmailLink
                annotation={{
                  gene: this.props.store.hugoSymbol,
                  alteration: this.props.store.alterationName,
                  cancerType: this.props.store.cancerTypeName,
                }}
                appStore={this.props.appStore}
                alteration={this.props.store.alterationNameWithDiff}
                proteinAlteration={
                  this.props.store.alteration?.proteinChange
                }
                isGermline={this.props.store.germline}
                extra={
                  this.props.store.cancerTypeName && (
                    <SomaticGermlineCancerTypeSelect
                      pretext="in"
                      cancerType={this.props.store.cancerTypeName}
                      isClearable={false}
                      routing={this.props.routing}
                      hugoSymbol={this.props.store.hugoSymbol}
                      alterationQuery={this.props.store.alterationQuery}
                      germline={this.props.store.germline}
                      onchange={x => (this.props.store.tumorTypeQuery = x)}
                      selectStyles={{
                        singleValue(base) {
                          return {
                            ...base,
                            color: COLOR_BLUE,
                          };
                        },
                        input(base) {
                          return {
                            ...base,
                            color: COLOR_BLUE,
                          };
                        },
                        menu(base) {
                          return {
                            ...base,
                            fontSize: '1rem',
                            fontFamily: '"Gotham Book", serif',
                          };
                        },
                      }}
                    />
                  )
                }
              />
              <GeneAdditionalInfoSection
                gene={this.props.store.gene.result}
                ensemblGenes={this.props.store.ensemblGenes.result}
                show={this.showAdditionalGeneInfo}
                onToggle={this.toggleAdditionalGeneInfo}
              />
              <Row className={classnames(styles.descriptionContainer)}>
                <Col>
                  <VariantOverView
                    alterationSummaries={this.alterationSummaries}
                    hugoSymbol={this.props.store.hugoSymbol}
                    alteration={
                      this.props.store.annotationData.result.query.alteration
                    }
                    geneType={this.props.store.gene.result.geneType}
                  />
                </Col>
              </Row>
            </Col>
            {(this.props.annotationType === AnnotationType.HGVSG ||
              this.props.annotationType === AnnotationType.GENOMIC_CHANGE) && (
              <Col
                md="2"
                className={
                  'd-flex flex-column align-items-center justify-content-start mt-4'
                }
              >
                <div className="text-center">Genomic annotation powered by</div>
                <PowerBySource
                  name={'Genome Nexus'}
                  url={'genomenexus.org'}
                  logo={gnLogo}
                />
                {this.props.store.annotationData.result.vue && (
                  <PowerBySource
                    name={'reVUE'}
                    url={'cancerrevue.org'}
                    logo={revueLogo}
                  />
                )}
              </Col>
            )}
          </Row>
          {this.props.store.annotationData.result.mutationEffect
            .description && (
            <Row>
              <Col>
                <ShowHideText
                  show={this.showMutationEffect}
                  title="mutation effect description"
                  content={
                    <MutationEffectDescription
                      hugoSymbol={this.props.store.hugoSymbol}
                      description={
                        this.props.store.annotationData.result.mutationEffect
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
          <Row>
            <Col>
              <SomaticGermlineAlterationTiles
                includeTitle
                variantAnnotation={this.props.store.annotationData.result}
                isGermline={this.props.store.germline}
                grch37Isoform={this.props.store.gene.result.grch37Isoform}
              />
            </Col>
          </Row>
          <div className="d-flex align-items-center">
            <MiniNavBarHeader
              id="clinical-implications"
              comingSoon={this.props.store.germline}
            >
              <span
                className={
                  this.props.store.germline ? 'text-secondary' : undefined
                }
              >
                Clinical Implications for this Biomarker
              </span>
            </MiniNavBarHeader>
          </div>
          {this.props.store.cancerTypeName ? (
            <CancerTypeView
              appStore={this.props.appStore}
              isLargeScreen={this.props.windowStore.isLargeScreen}
              userAuthenticated={
                this.props.authenticationStore.isUserAuthenticated
              }
              isGermline={false}
              hugoSymbol={this.props.store.hugoSymbol}
              alteration={this.props.store.alterationName}
              matchedAlteration={this.props.store.alteration}
              tumorType={this.props.store.cancerTypeName}
              onChangeTumorType={this.props.onChangeTumorType}
              annotation={this.props.store.annotationData.result}
              biologicalAlterations={
                this.props.store.biologicalAlterations.result
              }
              relevantAlterations={this.props.relevantAlterations}
              fdaImplication={this.fdaImplication}
              therapeuticImplications={this.therapeuticImplications}
              diagnosticImplications={this.diagnosticImplications}
              prognosticImplications={this.prognosticImplications}
              defaultSelectedTab={this.props.defaultSelectedTab}
              onChangeTab={this.props.onChangeTab}
            />
          ) : (
            <SomaticGermlineAlterationView
              appStore={this.props.appStore}
              hugoSymbol={this.props.store.hugoSymbol}
              alteration={this.props.store.alterationName}
              alterationQuery={this.props.store.alterationName}
              germline={false}
              matchedAlteration={this.props.store.alteration}
              tumorType={this.props.store.cancerTypeName}
              onChangeTumorType={this.props.onChangeTumorType}
              annotation={this.props.store.annotationData.result}
              biologicalAlterations={
                this.props.store.biologicalAlterations.result
              }
              relevantAlterations={this.props.relevantAlterations}
              fdaImplication={this.fdaImplication}
              therapeuticImplications={this.therapeuticImplications}
              diagnosticImplications={this.diagnosticImplications}
              prognosticImplications={this.prognosticImplications}
              defaultSelectedTab={this.props.defaultSelectedTab}
              onChangeTab={this.props.onChangeTab}
              routing={this.props.routing}
            />
          )}
        </StickyMiniNavBarContextProvider>
      </>
    );
  }

  render() {
    return this.props.annotationType === AnnotationType.GENE &&
      (this.props.store.gene.isError ||
        this.props.store.gene.result === DEFAULT_GENE) ? (
      <UnknownGeneAlert />
    ) : (
      <>
        {this.navBreadcrumbs}
        {this.pageShouldBeRendered ? (
          this.props.store.annotationData.result.query.hugoSymbol ? (
            this.getAnnotationComponents()
          ) : (
            <Alert variant="warning" className={'text-center'}>
              We do not have any information for this variant
            </Alert>
          )
        ) : (
          <If condition={this.props.store.annotationData.isError}>
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
