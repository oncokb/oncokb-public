import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  AnnotationStore,
  TherapeuticImplication,
} from 'app/store/AnnotationStore';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import { Else, If, Then } from 'react-if';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import { Redirect, RouteComponentProps } from 'react-router';
import { Col, Row } from 'react-bootstrap';
import styles from './GenePage.module.scss';
import {
  FdaLevelIcon,
  getCancerTypeNameFromOncoTreeType,
  levelOfEvidence2Level,
  OncoKBLevelIcon,
} from 'app/shared/utils/Utils';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import BarChart from 'app/components/barChart/BarChart';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_GENE,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVELS,
  PAGE_ROUTE,
  REFERENCE_GENOME,
} from 'app/config/constants';
import { ClinicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { AlterationPageLink, CitationLink } from 'app/shared/utils/UrlUtils';
import AppStore from 'app/store/AppStore';
import _ from 'lodash';
import { MskimpactLink } from 'app/components/MskimpactLink';
import { OncokbMutationMapper } from 'app/components/oncokbMutationMapper/OncokbMutationMapper';
import { CitationTooltip } from 'app/components/CitationTooltip';
import WindowStore, { IWindowSize } from 'app/store/WindowStore';
import { DataFilterType, onFilterOptionSelect } from 'react-mutation-mapper';
import { CANCER_TYPE_FILTER_ID } from 'app/components/oncokbMutationMapper/FilterUtils';
import DocumentTitle from 'react-document-title';
import { UnknownGeneAlert } from 'app/shared/alert/UnknownGeneAlert';
import { Linkout } from 'app/shared/links/Linkout';
import { ReferenceGenomeInfo } from './ReferenceGenomeInfo';
import WithSeparator from 'react-with-separator';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';
import * as QueryString from 'query-string';
import { RouterStore } from 'mobx-react-router';
import {
  GenePageHashQueries,
  GenePageSearchQueries,
} from 'app/shared/route/types';
import AlterationTableTabs from 'app/pages/annotationPage/AlterationTableTabs';
import { COLOR_BLUE } from 'app/config/theme';

enum GENE_TYPE_DESC {
  ONCOGENE = 'Oncogene',
  TUMOR_SUPPRESSOR = 'Tumor Suppressor',
}

const getGeneTypeSentence = (oncogene: boolean, tsg: boolean) => {
  const geneTypes = [];
  if (oncogene) {
    geneTypes.push(GENE_TYPE_DESC.ONCOGENE);
  }
  if (tsg) {
    geneTypes.push(GENE_TYPE_DESC.TUMOR_SUPPRESSOR);
  }
  return geneTypes.join(', ');
};

const HighestLevelItem: React.FunctionComponent<{
  level: LEVELS;
  key?: string;
}> = props => {
  let isFdaLevel = false;
  let levelText = '';
  switch (props.level) {
    case LEVELS.FDAx1:
    case LEVELS.FDAx2:
    case LEVELS.FDAx3:
      levelText = `FDA Level ${props.level.replace('FDAx', '')}`;
      isFdaLevel = true;
      break;
    default:
      levelText = `Level ${props.level}`;
      break;
  }
  return (
    <span className={'d-flex align-items-center'}>
      <span className={`oncokb level-${props.level}`}>{levelText}</span>
      {isFdaLevel ? (
        <FdaLevelIcon level={props.level} />
      ) : (
        <OncoKBLevelIcon level={props.level} withDescription />
      )}
    </span>
  );
};

export const getHighestLevelStrings = (
  highestSensitiveLevel: string | undefined,
  highestResistanceLevel: string | undefined,
  highestDiagnosticImplicationLevel?: string | undefined,
  highestPrognosticImplicationLevel?: string | undefined,
  highestFdaLevel?: string | undefined,
  separator: string | JSX.Element = ', '
) => {
  const levels: React.ReactNode[] = [];
  if (highestSensitiveLevel) {
    const level = levelOfEvidence2Level(highestSensitiveLevel, false);
    levels.push(
      <HighestLevelItem level={level} key={'highestSensitiveLevel'} />
    );
  }
  if (highestResistanceLevel) {
    const level = levelOfEvidence2Level(highestResistanceLevel, false);
    levels.push(
      <HighestLevelItem level={level} key={'highestResistanceLevel'} />
    );
  }
  if (highestDiagnosticImplicationLevel) {
    const level = levelOfEvidence2Level(
      highestDiagnosticImplicationLevel,
      false
    );
    levels.push(
      <HighestLevelItem
        level={level}
        key={'highestDiagnosticImplicationLevel'}
      />
    );
  }
  if (highestPrognosticImplicationLevel) {
    const level = levelOfEvidence2Level(
      highestPrognosticImplicationLevel,
      false
    );
    levels.push(
      <HighestLevelItem
        level={level}
        key={'highestPrognosticImplicationLevel'}
      />
    );
  }
  if (highestFdaLevel) {
    const level = levelOfEvidence2Level(highestFdaLevel, false);
    levels.push(<HighestLevelItem level={level} key={'highestFdaLevel'} />);
  }
  return (
    <WithSeparator
      separator={<span className="mx-1">·</span>}
      key={'highest-levels'}
    >
      {levels}
    </WithSeparator>
  );
};

type GeneInfoProps = {
  gene: Gene;
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
  highestDiagnosticImplicationLevel?: string | undefined;
  highestPrognosticImplicationLevel?: string | undefined;
  highestFdaLevel?: string | undefined;
};

type GeneInfoItem = {
  key: string;
  element: JSX.Element | string;
};

const GeneInfo: React.FunctionComponent<GeneInfoProps> = props => {
  const gene = props.gene;
  const info: GeneInfoItem[] = [];

  // gene type
  if (gene.oncogene || gene.tsg) {
    info.push({
      key: 'geneType',
      element: (
        <div>
          <h5>{getGeneTypeSentence(gene.oncogene, gene.tsg)}</h5>
        </div>
      ),
    });
  }

  // highest LoE
  if (
    props.highestResistanceLevel ||
    props.highestSensitiveLevel ||
    props.highestDiagnosticImplicationLevel ||
    props.highestPrognosticImplicationLevel ||
    props.highestFdaLevel
  ) {
    info.push({
      key: 'loe',
      element: (
        <div>
          <h5 className={'d-flex align-items-center flex-wrap'}>
            <span className={'mr-2'}>Highest level of evidence:</span>
            {getHighestLevelStrings(
              props.highestSensitiveLevel,
              props.highestResistanceLevel,
              props.highestDiagnosticImplicationLevel,
              props.highestPrognosticImplicationLevel,
              props.highestFdaLevel
            )}
          </h5>
        </div>
      ),
    });
  }

  if (gene.geneAliases.length > 0) {
    info.push({
      key: 'aliases',
      element: <div>{`Also known as ${gene.geneAliases.join(', ')}`}</div>,
    });
  }

  const additionalInfo: React.ReactNode[] = [];

  if (gene.entrezGeneId > 0) {
    additionalInfo.push(
      <div key="geneId">
        Gene ID:{' '}
        {gene.entrezGeneId > 0 ? (
          <Linkout
            className={styles.lowKeyLinkout}
            link={`https://www.ncbi.nlm.nih.gov/gene/${gene.entrezGeneId}`}
          >
            {gene.entrezGeneId}
          </Linkout>
        ) : (
          <span className={'ml-1'}>{gene.entrezGeneId}</span>
        )}
      </div>
    );
  }
  if (gene.grch37Isoform || gene.grch37RefSeq) {
    additionalInfo.push(
      <ReferenceGenomeInfo
        key={REFERENCE_GENOME.GRCh37}
        referenceGenomeName={REFERENCE_GENOME.GRCh37}
        isoform={gene.grch37Isoform}
        refseq={gene.grch37RefSeq}
      />
    );
  }
  if (gene.grch38Isoform || gene.grch38RefSeq) {
    additionalInfo.push(
      <ReferenceGenomeInfo
        key={REFERENCE_GENOME.GRCh38}
        referenceGenomeName={REFERENCE_GENOME.GRCh38}
        isoform={gene.grch38Isoform}
        refseq={gene.grch38RefSeq}
      />
    );
  }

  info.push({
    key: 'additionalInfo',
    element: <div className={styles.geneAdditionalInfo}>{additionalInfo}</div>,
  });

  return (
    <>
      {info.map(record => (
        <Row key={record.key}>
          <Col>{record.element}</Col>
        </Row>
      ))}
    </>
  );
};

const GeneBackground: React.FunctionComponent<{
  show: boolean;
  geneBackground: string;
  hugoSymbol: string;
  onClick: () => void;
  className?: string;
}> = props => {
  return (
    <div className={props.className}>
      <div onClick={() => props.onClick()}>
        <i>{`${props.show ? 'Hide' : 'Show'} ${
          props.hugoSymbol
        } background`}</i>
        <i
          className={`fa ${
            props.show ? 'fa-arrow-circle-o-up' : 'fa-arrow-circle-o-down'
          } ml-2`}
        />
      </div>
      {props.show ? <CitationLink content={props.geneBackground} /> : undefined}
    </div>
  );
};

interface MatchParams {
  hugoSymbol: string;
}

interface GenePageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  windowStore: WindowStore;
  routing: RouterStore;
}

@inject('appStore', 'windowStore', 'routing')
@observer
export default class GenePage extends React.Component<GenePageProps, any> {
  @observable hugoSymbolQuery: string;
  @observable showGeneBackground: boolean;
  @observable selectedTab: ANNOTATION_PAGE_TAB_KEYS;
  @observable defaultSelectedTab: ANNOTATION_PAGE_TAB_KEYS;

  private store: AnnotationStore;
  readonly reactions: IReactionDisposer[] = [];

  getAlterationsByLevelType(
    alterations: ClinicalVariant[],
    levelType: LEVEL_TYPES
  ) {
    return _.filter(alterations, alt => {
      return LEVEL_CLASSIFICATION[alt.level] === levelType;
    });
  }

  @computed
  get filteredTxAlterations() {
    if (this.store.filteredClinicalAlterations.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.filteredClinicalAlterations,
      LEVEL_TYPES.TX
    );
  }

  getClinicalImplications(
    clinicalVariants: ClinicalVariant[]
  ): TherapeuticImplication[] {
    return clinicalVariants.map(variant => {
      const cancerTypeNames = variant.cancerTypes.map(cancerType =>
        getCancerTypeNameFromOncoTreeType(cancerType)
      );
      return {
        level: variant.level,
        alterations: variant.variant.name,
        alterationsView: (
          <AlterationPageLink
            key={variant.variant.name}
            hugoSymbol={this.store.hugoSymbol}
            alteration={variant.variant.name}
            alterationRefGenomes={
              variant.variant.referenceGenomes as REFERENCE_GENOME[]
            }
          />
        ),
        drugs: variant.drug.join(', '),
        cancerTypes: cancerTypeNames.join(', '),
        cancerTypesView: (
          <WithSeparator separator={', '}>
            {cancerTypeNames.map(cancerType => (
              <AlterationPageLink
                key={`${variant.variant.name}-${cancerType}`}
                hugoSymbol={this.store.hugoSymbol}
                alteration={variant.variant.name}
                alterationRefGenomes={
                  variant.variant.referenceGenomes as REFERENCE_GENOME[]
                }
                cancerType={cancerType}
              >
                {cancerType}
              </AlterationPageLink>
            ))}
          </WithSeparator>
        ),
        citations: {
          abstracts: variant.drugAbstracts,
          pmids: variant.drugPmids,
        },
      };
    });
  }

  @computed
  get filteredDxAlterations() {
    if (this.store.filteredClinicalAlterations.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.filteredClinicalAlterations,
      LEVEL_TYPES.DX
    );
  }

  @computed
  get filteredPxAlterations() {
    if (this.store.filteredClinicalAlterations.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.filteredClinicalAlterations,
      LEVEL_TYPES.PX
    );
  }

  constructor(props: any) {
    super(props);
    this.hugoSymbolQuery = props.match.params
      ? props.match.params.hugoSymbol
      : undefined;
    this.store = new AnnotationStore({
      hugoSymbolQuery: this.hugoSymbolQuery,
    });
    const queryStringsHash = QueryString.parse(
      window.location.hash
    ) as GenePageHashQueries;
    if (queryStringsHash.tab) {
      this.selectedTab = queryStringsHash.tab;
    }

    this.props.appStore.toFdaRecognizedContent = false;
    this.reactions.push(
      reaction(
        () => this.defaultShowGeneBackground,
        defaultShowGeneBackground => {
          if (
            this.showGeneBackground === undefined &&
            defaultShowGeneBackground !== undefined
          ) {
            this.showGeneBackground = defaultShowGeneBackground;
          }
        }
      ),
      reaction(
        () => [props.routing.location.search],
        ([search]) => {
          const queryStrings = QueryString.parse(
            search
          ) as GenePageSearchQueries;
          if (queryStrings.refGenome) {
            this.store.referenceGenomeQuery = queryStrings.refGenome;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash) as GenePageHashQueries;
          if (queryStrings.tab) {
            this.defaultSelectedTab = queryStrings.tab;
            if (queryStrings.tab === ANNOTATION_PAGE_TAB_KEYS.FDA) {
              this.props.appStore.inFdaRecognizedContent = true;
            }
          }
        },
        true
      )
    );
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.match.params.hugoSymbol !== prevProps.match.params.hugoSymbol
    ) {
      this.hugoSymbolQuery = this.props.match.params.hugoSymbol;
      this.store.hugoSymbolQuery = this.hugoSymbolQuery;
    }
  }

  @autobind
  @action
  toggleGeneBackground() {
    this.showGeneBackground = !this.showGeneBackground;
  }

  @autobind
  @action
  onChangeTab(
    selectedTab: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) {
    if (newTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA) {
      this.props.appStore.inFdaRecognizedContent = true;
    }
    if (
      selectedTab === ANNOTATION_PAGE_TAB_KEYS.FDA &&
      newTabKey !== ANNOTATION_PAGE_TAB_KEYS.FDA
    ) {
      this.props.appStore.showFdaModal = true;
    } else {
      const newHash: GenePageHashQueries = { tab: newTabKey };
      window.location.hash = QueryString.stringify(newHash);
    }
  }

  @computed
  get pageShouldBeRendered() {
    return (
      this.store.geneNumber.isComplete &&
      this.store.gene.isComplete &&
      this.store.clinicalAlterations.isComplete &&
      this.store.biologicalAlterations.isComplete
    );
  }

  @computed
  get genePanelClass() {
    if (this.store.barChartData.length > 0) {
      return {
        xl: 7,
        lg: 6,
        xs: 12,
      };
    } else {
      return {
        xs: 12,
      };
    }
  }

  @computed
  get defaultShowGeneBackground() {
    if (this.store.biologicalAlterations.isComplete) {
      return this.store.biologicalAlterations.result.length === 0;
    } else {
      return undefined;
    }
  }

  componentWillUnmount(): void {
    for (const reactionItem of this.reactions) {
      reactionItem();
    }
    this.store.destroy();
  }

  @computed
  get windowWrapper() {
    const MAX_WIDTH = 1442;
    if (this.props.windowStore.size.width > MAX_WIDTH) {
      const windowSize: IWindowSize = {
        width: MAX_WIDTH,
        height: this.props.windowStore.size.height,
      };
      return { size: windowSize };
    }
    return this.props.windowStore;
  }

  render() {
    return (
      <DocumentTitle title={this.store.hugoSymbol}>
        <If condition={!!this.hugoSymbolQuery}>
          <Then>
            <If condition={this.store.gene.isComplete}>
              <Then>
                {this.store.gene.isError ||
                this.store.gene.result === DEFAULT_GENE ? (
                  <UnknownGeneAlert />
                ) : (
                  <If condition={this.pageShouldBeRendered}>
                    <Then>
                      <Row>
                        <Col {...this.genePanelClass}>
                          <div className="">
                            <h2>
                              {this.store.hugoSymbol}
                              <span
                                style={{ fontSize: '0.5em' }}
                                className={'ml-2'}
                              >
                                <FeedbackIcon
                                  feedback={{
                                    type: FeedbackType.ANNOTATION,
                                    annotation: {
                                      gene: this.store.hugoSymbol,
                                    },
                                  }}
                                  appStore={this.props.appStore}
                                />
                              </span>
                            </h2>
                            <GeneInfo
                              gene={this.store.gene.result}
                              highestSensitiveLevel={
                                this.store.geneNumber.result
                                  .highestSensitiveLevel
                              }
                              highestResistanceLevel={
                                this.store.geneNumber.result
                                  .highestResistanceLevel
                              }
                              highestDiagnosticImplicationLevel={
                                this.store.geneNumber.result
                                  .highestDiagnosticImplicationLevel
                              }
                              highestPrognosticImplicationLevel={
                                this.store.geneNumber.result
                                  .highestPrognosticImplicationLevel
                              }
                              highestFdaLevel={this.store.highestFdaLevel}
                            />
                            {this.store.geneSummary.result ? (
                              <div className="mt-2">
                                {this.store.geneSummary.result}
                              </div>
                            ) : undefined}
                            {this.store.geneBackground.result ? (
                              <GeneBackground
                                className="mt-2"
                                show={this.showGeneBackground}
                                hugoSymbol={this.store.hugoSymbol}
                                geneBackground={
                                  this.store.geneBackground.result
                                }
                                onClick={this.toggleGeneBackground}
                              />
                            ) : undefined}
                          </div>
                        </Col>
                        {this.store.barChartData.length > 0 ? (
                          <Col
                            xl={5}
                            lg={6}
                            xs={12}
                            className={'d-flex flex-column align-items-center'}
                          >
                            <div>
                              <b>
                                Cancer Types with {this.store.hugoSymbol}{' '}
                                Mutations
                              </b>
                              <DefaultTooltip
                                overlay={() => (
                                  <div style={{ maxWidth: 300 }}>
                                    Currently, the mutation frequency does not
                                    take into account copy number changes,
                                    chromosomal translocations or cancer types
                                    with fewer than 50 samples in{' '}
                                    <MskimpactLink />
                                  </div>
                                )}
                              >
                                <i className="fa fa-question-circle-o ml-2" />
                              </DefaultTooltip>
                            </div>
                            <BarChart
                              data={this.store.barChartData}
                              height={300}
                              filters={this.store.selectedCancerTypes}
                              windowStore={this.props.windowStore}
                              onUserSelection={selectedCancerTypes =>
                                this.store.mutationMapperStore &&
                                this.store.mutationMapperStore.result
                                  ? onFilterOptionSelect(
                                      selectedCancerTypes,
                                      false,
                                      this.store.mutationMapperStore.result
                                        .dataStore,
                                      DataFilterType.CANCER_TYPE,
                                      CANCER_TYPE_FILTER_ID
                                    )
                                  : undefined
                              }
                            />
                          </Col>
                        ) : null}
                      </Row>
                      <If condition={this.store.gene.result.entrezGeneId > 0}>
                        <Row className={'mt-5'}>
                          <Col xs={12}>
                            <h6>
                              Annotated Mutation Distribution in{' '}
                              <MskimpactLink />
                            </h6>
                          </Col>
                          <Col xs={12}>
                            <OncokbMutationMapper
                              {...this.store.mutationMapperProps.result}
                              store={this.store.mutationMapperStore.result}
                              oncogenicities={this.store.uniqOncogenicity}
                              showTrackSelector={false}
                              windowWrapper={this.windowWrapper}
                            />
                          </Col>
                        </Row>
                      </If>
                      <Row className={'mt-2'}>
                        <Col>
                          <If condition={this.store.fdaAlterations.isPending}>
                            <Then>
                              <LoadingIndicator isLoading={true} />
                            </Then>
                            <Else>
                              <AlterationTableTabs
                                selectedTab={this.defaultSelectedTab}
                                hugoSymbol={this.store.hugoSymbol}
                                biological={
                                  this.store.filteredBiologicalAlterations
                                }
                                tx={this.getClinicalImplications(
                                  this.filteredTxAlterations
                                )}
                                dx={this.getClinicalImplications(
                                  this.filteredDxAlterations
                                )}
                                px={this.getClinicalImplications(
                                  this.filteredPxAlterations
                                )}
                                fda={this.store.fdaAlterations.result}
                                onChangeTab={this.onChangeTab}
                              />
                            </Else>
                          </If>
                        </Col>
                      </Row>
                    </Then>
                    <Else>
                      <LoadingIndicator
                        size={LoaderSize.LARGE}
                        center={true}
                        isLoading={this.store.gene.isPending}
                      />
                    </Else>
                  </If>
                )}
              </Then>
              <Else>
                <LoadingIndicator
                  size={LoaderSize.LARGE}
                  center={true}
                  isLoading={this.store.gene.isPending}
                />
              </Else>
            </If>
          </Then>
          <Else>
            <Redirect to={PAGE_ROUTE.HOME} />
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
