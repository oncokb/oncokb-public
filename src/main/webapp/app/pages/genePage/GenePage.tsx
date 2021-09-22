import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore } from 'app/store/AnnotationStore';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import { Else, If, Then } from 'react-if';
import { Citations, Gene } from 'app/shared/api/generated/OncoKbAPI';
import { Redirect, RouteComponentProps } from 'react-router';
import { Col, Row } from 'react-bootstrap';
import styles from './GenePage.module.scss';
import {
  FdaLevelIcon,
  filterByKeyword,
  getCancerTypeNameFromOncoTreeType,
  getDefaultColumnDefinition,
  levelOfEvidence2Level,
  OncoKBLevelIcon,
} from 'app/shared/utils/Utils';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import BarChart from 'app/components/barChart/BarChart';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { ReportIssue } from 'app/components/ReportIssue';
import Tabs from 'react-responsive-tabs';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  ANNOTATION_PAGE_TAB_NAMES,
  DEFAULT_GENE,
  DEFAULT_MESSAGE_HEME_ONLY_DX,
  DEFAULT_MESSAGE_HEME_ONLY_PX,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVELS,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
} from 'app/config/constants';
import {
  BiologicalVariant,
  ClinicalVariant,
  FdaAlteration,
  TumorType,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import {
  AlterationPageLink,
  CitationLink,
  TumorTypePageLink,
} from 'app/shared/utils/UrlUtils';
import AppStore from 'app/store/AppStore';
import { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
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
import { GenePageTable } from './GenePageTable';
import { LevelOfEvidencePageLink } from 'app/shared/links/LevelOfEvidencePageLink';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';
import { defaultSortMethod } from 'app/shared/utils/ReactTableUtils';
import * as QueryString from 'query-string';
import { RouterStore } from 'mobx-react-router';
import { Link } from 'react-router-dom';
import { Version } from 'app/pages/LevelOfEvidencePage';
import { FDA_ALTERATIONS_TABLE_COLUMNS } from 'app/pages/genePage/FdaUtils';
import {
  GenePageHashQueries,
  GenePageSearchQueries,
} from 'app/shared/route/types';
import { getTabDefaultActiveKey } from 'app/shared/utils/TempAnnotationUtils';

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
  highestFdaLevel: string | undefined,
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
        referenceGenomeName={REFERENCE_GENOME.GRCh37}
        isoform={gene.grch37Isoform}
        refseq={gene.grch37RefSeq}
      />
    );
  }
  if (gene.grch38Isoform || gene.grch38RefSeq) {
    additionalInfo.push(
      <ReferenceGenomeInfo
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
  @observable defaultSelectedTab: ANNOTATION_PAGE_TAB_KEYS =
    ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL;

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
  get txAlterations() {
    if (this.store.clinicalAlterations.result.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.clinicalAlterations.result,
      LEVEL_TYPES.TX
    );
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

  @computed
  get dxAlterations() {
    if (this.store.clinicalAlterations.result.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.clinicalAlterations.result,
      LEVEL_TYPES.DX
    );
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
  get pxAlterations() {
    if (this.store.clinicalAlterations.result.length === 0) {
      return [];
    }
    return _.filter(this.store.clinicalAlterations.result, alt => {
      return LEVEL_CLASSIFICATION[alt.level] === LEVEL_TYPES.PX;
    });
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

  @computed
  get clinicalTableColumns(): SearchColumn<ClinicalVariant>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        accessor: 'level',
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
        accessor: 'variant',
        onFilter: (data: ClinicalVariant, keyword) =>
          filterByKeyword(data.variant.name, keyword),
        Cell: (props: { original: ClinicalVariant }) => {
          return (
            <>
              <AlterationPageLink
                hugoSymbol={this.store.hugoSymbol}
                alteration={props.original.variant.name}
                alterationRefGenomes={
                  props.original.variant.referenceGenomes as REFERENCE_GENOME[]
                }
              />
            </>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CANCER_TYPES),
        onFilter: (data: ClinicalVariant, keyword) =>
          filterByKeyword(
            data.cancerTypes
              .map(cancerType => getCancerTypeNameFromOncoTreeType(cancerType))
              .join(', '),
            keyword
          ),
        sortMethod(a: TumorType[], b: TumorType[]): number {
          return defaultSortMethod(
            a
              .map(cancerType => getCancerTypeNameFromOncoTreeType(cancerType))
              .join(','),
            b
              .map(cancerType => getCancerTypeNameFromOncoTreeType(cancerType))
              .join(',')
          );
        },
        Cell: (props: { original: ClinicalVariant }) => {
          const cancerTypes = props.original.cancerTypes.map(cancerType => (
            <TumorTypePageLink
              hugoSymbol={this.store.hugoSymbol}
              alteration={props.original.variant.name}
              tumorType={getCancerTypeNameFromOncoTreeType(cancerType)}
            />
          ));
          return <WithSeparator separator={', '}>{cancerTypes}</WithSeparator>;
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
        accessor: 'drug',
        sortMethod(a, b) {
          return defaultSortMethod(a.join(','), b.join(','));
        },
        onFilter: (data: ClinicalVariant, keyword) =>
          _.some(data.drug, (drug: string) =>
            drug.toLowerCase().includes(keyword)
          ),

        Cell(props: { original: ClinicalVariant }) {
          return (
            <WithSeparator separator={<br />}>
              {props.original.drug}
            </WithSeparator>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
        accessor(d) {
          return {
            abstracts: d.drugAbstracts,
            pmids: d.drugPmids,
          } as Citations;
        },
      },
    ];
  }

  @computed
  get dxpxTableColumns(): SearchColumn<ClinicalVariant>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        accessor: 'level',
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
        accessor: 'variant',
        onFilter: (data: ClinicalVariant, keyword) =>
          filterByKeyword(data.variant.name, keyword),
        Cell: (props: { original: ClinicalVariant }) => {
          return (
            <>
              <AlterationPageLink
                hugoSymbol={this.store.hugoSymbol}
                alteration={props.original.variant.name}
                alterationRefGenomes={
                  props.original.variant.referenceGenomes as REFERENCE_GENOME[]
                }
              />
            </>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CANCER_TYPES),
        onFilter: (data: ClinicalVariant, keyword) =>
          filterByKeyword(
            data.cancerTypes
              .map(cancerType => getCancerTypeNameFromOncoTreeType(cancerType))
              .join(', '),
            keyword
          ),
        sortMethod(a: TumorType[], b: TumorType[]): number {
          return defaultSortMethod(
            a
              .map(cancerType => getCancerTypeNameFromOncoTreeType(cancerType))
              .join(','),
            b
              .map(cancerType => getCancerTypeNameFromOncoTreeType(cancerType))
              .join(',')
          );
        },
        Cell: (props: { original: ClinicalVariant }) => {
          const cancerTypes = props.original.cancerTypes.map(cancerType => (
            <TumorTypePageLink
              hugoSymbol={this.store.hugoSymbol}
              alteration={props.original.variant.name}
              tumorType={getCancerTypeNameFromOncoTreeType(cancerType)}
            />
          ));
          return <WithSeparator separator={', '}>{cancerTypes}</WithSeparator>;
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
        minWidth: 50,
        accessor(d) {
          return {
            abstracts: d.drugAbstracts,
            pmids: d.drugPmids,
          } as Citations;
        },
      },
    ];
  }

  @computed
  get biologicalTableColumns(): SearchColumn<BiologicalVariant>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
        accessor: 'variant',
        onFilter: (data: BiologicalVariant, keyword) =>
          filterByKeyword(data.variant.name, keyword),
        Cell: (props: { original: BiologicalVariant }) => {
          return (
            <>
              <AlterationPageLink
                hugoSymbol={this.store.hugoSymbol}
                alteration={props.original.variant.name}
                alterationRefGenomes={
                  props.original.variant.referenceGenomes as REFERENCE_GENOME[]
                }
              />
            </>
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ONCOGENICITY),
        onFilter: (data: BiologicalVariant, keyword) =>
          filterByKeyword(data.oncogenic, keyword),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.MUTATION_EFFECT),
        onFilter: (data: BiologicalVariant, keyword) =>
          filterByKeyword(data.mutationEffect, keyword),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
        accessor(d) {
          return {
            abstracts: d.mutationEffectAbstracts,
            pmids: d.mutationEffectPmids,
          } as Citations;
        },
        Cell(props: { original: BiologicalVariant }) {
          const numOfReferences =
            props.original.mutationEffectAbstracts.length +
            props.original.mutationEffectPmids.length;
          return (
            <DefaultTooltip
              placement={'left'}
              overlay={() => (
                <CitationTooltip
                  pmids={props.original.mutationEffectPmids}
                  abstracts={props.original.mutationEffectAbstracts}
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

  @computed
  get fdaTableColumns() {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
        accessor: 'alteration',
        width: 400,
        onFilter: (data: FdaAlteration, keyword: string) =>
          filterByKeyword(data.alteration.name, keyword),
        Cell: (props: { original: FdaAlteration }) => {
          return (
            <AlterationPageLink
              hugoSymbol={props.original.alteration.gene.hugoSymbol}
              alteration={props.original.alteration.name}
              hashQueries={{ tab: ANNOTATION_PAGE_TAB_KEYS.FDA }}
              onClick={() => {
                this.props.appStore.toFdaRecognizedContent = true;
              }}
            />
          );
        },
      },
      ...FDA_ALTERATIONS_TABLE_COLUMNS,
    ];
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

  isOncogenicMutations(alteration: string) {
    return alteration.toLowerCase() === 'oncogenic mutations';
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

  getTabDescription(key: ANNOTATION_PAGE_TAB_KEYS) {
    if (key === ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL) {
      return (
        <span>
          A list of the oncogenic and mutation effects of{' '}
          <b>all OncoKB curated</b> {this.store.hugoSymbol} alterations.
        </span>
      );
    } else if (key === ANNOTATION_PAGE_TAB_KEYS.TX) {
      return (
        <span>
          A list of the cancer type-specific {this.store.hugoSymbol} alterations
          that may predict response to a targeted drug and the corresponding
          OncoKB level of evidence assigning their level of{' '}
          <LevelOfEvidencePageLink levelType={LEVEL_TYPES.TX}>
            clinical actionability
          </LevelOfEvidencePageLink>
          .
        </span>
      );
    } else if (key === ANNOTATION_PAGE_TAB_KEYS.DX) {
      return (
        <span>
          A list of diagnostic {this.store.hugoSymbol} alterations and the
          corresponding{' '}
          <LevelOfEvidencePageLink levelType={LEVEL_TYPES.DX}>
            OncoKB diagnostic level of evidence
          </LevelOfEvidencePageLink>
          . {DEFAULT_MESSAGE_HEME_ONLY_DX}
        </span>
      );
    } else if (key === ANNOTATION_PAGE_TAB_KEYS.PX) {
      return (
        <span>
          A list of tumor-type specific prognostic {this.store.hugoSymbol}{' '}
          alterations and the corresponding{' '}
          <LevelOfEvidencePageLink levelType={LEVEL_TYPES.PX}>
            OncoKB prognostic level of evidence
          </LevelOfEvidencePageLink>
          . {DEFAULT_MESSAGE_HEME_ONLY_PX}
        </span>
      );
    } else if (key === ANNOTATION_PAGE_TAB_KEYS.FDA) {
      return (
        <span>
          A list of the tumor type-specific {this.store.hugoSymbol} alterations
          and the corresponding{' '}
          <Link to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA_NGS}`}>
            FDA Level of Evidence
          </Link>{' '}
          assigning their clinical significance. The assigned{' '}
          <Link to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA}`}>
            FDA level of evidence
          </Link>{' '}
          is based on these alterations being tested in Formalin Fixed Paraffin
          Embedded (FFPE) specimen types, except in cases where specimen type is
          not specified.
        </span>
      );
    }
    return null;
  }

  @autobind
  @action
  onChangeTab(newTabKey: ANNOTATION_PAGE_TAB_KEYS) {
    if (newTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA) {
      this.props.appStore.inFdaRecognizedContent = true;
    }
    if (this.onFdaTab && newTabKey !== ANNOTATION_PAGE_TAB_KEYS.FDA) {
      this.props.appStore.showFdaModal = true;
    } else {
      const newHash: GenePageHashQueries = { tab: newTabKey };
      window.location.hash = QueryString.stringify(newHash);
    }
    this.selectedTab = newTabKey;
  }

  @action
  getTable(key: ANNOTATION_PAGE_TAB_KEYS) {
    switch (key) {
      case ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL:
        return (
          <GenePageTable
            data={this.store.filteredBiologicalAlterations}
            columns={this.biologicalTableColumns}
            isPending={this.store.biologicalAlterations.isPending}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.TX:
        return (
          <GenePageTable
            data={this.filteredTxAlterations}
            columns={this.clinicalTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.DX:
        return (
          <GenePageTable
            data={this.filteredDxAlterations}
            columns={this.dxpxTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.PX:
        return (
          <GenePageTable
            data={this.filteredPxAlterations}
            columns={this.dxpxTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.FDA:
        return (
          <GenePageTable
            data={this.store.fdaAlterations.result}
            columns={this.fdaTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      default:
        return <span />;
    }
  }

  @computed
  get tabs() {
    const tabs: { title: string; key: ANNOTATION_PAGE_TAB_KEYS }[] = [];
    if (this.store.biologicalAlterations.result.length > 0) {
      tabs.push({
        key: ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL,
        title: ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL],
      });
    }
    if (this.store.clinicalAlterations.result.length > 0) {
      if (this.txAlterations.length > 0) {
        tabs.push({
          key: ANNOTATION_PAGE_TAB_KEYS.TX,
          title: ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.TX],
        });
      }
      if (this.dxAlterations.length > 0) {
        tabs.push({
          key: ANNOTATION_PAGE_TAB_KEYS.DX,
          title: ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.DX],
        });
      }
      if (this.pxAlterations.length > 0) {
        tabs.push({
          key: ANNOTATION_PAGE_TAB_KEYS.PX,
          title: ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.PX],
        });
      }
    }
    if (this.store.fdaAlterations.result.length > 0) {
      tabs.push({
        key: ANNOTATION_PAGE_TAB_KEYS.FDA,
        title: ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.FDA],
      });
    }
    return tabs;
  }

  @computed
  get tabDescriptionStyle() {
    return this.props.windowStore.isLargeScreen
      ? {
          width: '80%',
          marginBottom: '-30px',
        }
      : undefined;
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
  get tabDefaultActiveKey() {
    return getTabDefaultActiveKey(
      this.txAlterations.length > 0,
      this.dxAlterations.length > 0,
      this.pxAlterations.length > 0,
      this.store.fdaAlterations.result.length > 0,
      this.defaultSelectedTab
    );
  }

  @computed
  get onFdaTab() {
    return this.selectedTab === undefined
      ? this.tabDefaultActiveKey === ANNOTATION_PAGE_TAB_KEYS.FDA
      : this.selectedTab === ANNOTATION_PAGE_TAB_KEYS.FDA;
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
  get documentTitle() {
    return `Gene: ${this.store.hugoSymbol}`;
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
      <DocumentTitle title={this.documentTitle}>
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
                          <Tabs
                            selectedTabKey={
                              this.selectedTab
                                ? this.selectedTab
                                : this.tabDefaultActiveKey
                            }
                            onChange={this.onChangeTab}
                            items={this.tabs.map(tab => {
                              return {
                                title: tab.title,
                                getContent: () => {
                                  return (
                                    <div>
                                      <div style={this.tabDescriptionStyle}>
                                        <div>
                                          {this.getTabDescription(tab.key)}
                                        </div>
                                        <ReportIssue
                                          appStore={this.props.appStore}
                                          annotation={{
                                            gene: this.store.hugoSymbol,
                                          }}
                                        />
                                      </div>
                                      {this.getTable(tab.key)}
                                    </div>
                                  );
                                },
                                /* Optional parameters */
                                key: tab.key,
                                tabClassName: styles.tab,
                                panelClassName: styles.panel,
                              };
                            })}
                            transform={false}
                          />
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
            <Redirect to={'/'} />
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
