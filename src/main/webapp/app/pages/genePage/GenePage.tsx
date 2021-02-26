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
import { Redirect, RouteComponentProps, Prompt } from 'react-router';
import { Button, Col, Row, Modal } from 'react-bootstrap';
import styles from './GenePage.module.scss';
import {
  filterByKeyword,
  getCancerTypeNameFromOncoTreeType,
  getDefaultColumnDefinition,
  levelOfEvidence2Level,
  OncoKBLevelIcon,
} from 'app/shared/utils/Utils';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import BarChart from 'app/components/barChart/BarChart';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { ReportIssue } from 'app/components/ReportIssue';
import Tabs from 'react-responsive-tabs';
import {
  DEFAULT_GENE,
  DEFAULT_MESSAGE_HEME_ONLY_DX,
  DEFAULT_MESSAGE_HEME_ONLY_PX,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  LEVELS,
  FDA_LEVELS_OF_EVIDENCE_LINK,
  LG_TABLE_FIXED_HEIGHT,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
  LEVEL_PRIORITY,
} from 'app/config/constants';
import {
  BiologicalVariant,
  ClinicalVariant,
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
import InfoIcon from 'app/shared/icons/InfoIcon';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import * as QueryString from 'query-string';
import {
  FdaVariant,
  getFdaData,
  getFdaLevel,
  getReferenceCell,
} from 'app/pages/genePage/FdaUtils';
import { RouterStore } from 'mobx-react-router';
import { Location } from 'history';
import { LICENSE_HASH_KEY } from 'app/pages/RegisterPage';
import { Link } from 'react-router-dom';
import { Version } from 'app/pages/LevelOfEvidencePage';

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
  return (
    <span className={'d-flex align-items-center'}>
      <span className={`oncokb level-${props.level}`} key={props.key}>
        Level {props.level}
      </span>
      <OncoKBLevelIcon level={props.level} withDescription />
    </span>
  );
};

export const getHighestLevelStrings = (
  highestSensitiveLevel: string | undefined,
  highestResistanceLevel: string | undefined,
  highestDiagnosticImplicationLevel?: string | undefined,
  highestPrognosticImplicationLevel?: string | undefined,
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
};

type GeneInfoItem = {
  key: string;
  element: JSX.Element | string;
};

type SearchQueries = {
  refGenome?: REFERENCE_GENOME;
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
    props.highestPrognosticImplicationLevel
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
              props.highestPrognosticImplicationLevel
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

enum TAB_KEYS {
  'BIOLOGICAL' = 'BIOLOGICAL',
  'TX' = 'TX',
  'DX' = 'DX',
  'PX' = 'PX',
  'FDA' = 'FDA',
}

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

const LEAVING_PAGE_MESSAGE =
  'You are now leaving the FDA-recognized portion of this page.';

@inject('appStore', 'windowStore', 'routing')
@observer
export default class GenePage extends React.Component<GenePageProps> {
  @observable hugoSymbolQuery: string;
  @observable showGeneBackground: boolean;
  @observable selectedTab: string;
  @observable showModal = false;
  @observable lastLocation: Location;

  private store: AnnotationStore;
  readonly reactions: IReactionDisposer[] = [];

  @computed
  get txAlterations() {
    if (this.store.clinicalAlterations.result.length === 0) {
      return [];
    }
    return _.filter(this.store.clinicalAlterations.result, alt => {
      return LEVEL_CLASSIFICATION[alt.level] === LEVEL_TYPES.TX;
    });
  }

  @computed
  get dxAlterations() {
    if (this.store.clinicalAlterations.result.length === 0) {
      return [];
    }
    return _.filter(this.store.clinicalAlterations.result, alt => {
      return LEVEL_CLASSIFICATION[alt.level] === LEVEL_TYPES.DX;
    });
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
  get fdaTableColumns(): SearchColumn<FdaVariant>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
        accessor: 'alteration',
        width: 400,
        onFilter: (data: FdaVariant, keyword) =>
          filterByKeyword(data.alteration.name, keyword),
        Cell: (props: { original: FdaVariant }) => {
          return (
            <AlterationPageLink
              hugoSymbol={this.store.hugoSymbol}
              alteration={props.original.alteration.name}
            />
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CANCER_TYPES),
        accessor: 'cancerType',
        width: 400,
        Header: <span>Cancer Type</span>,
        onFilter: (data: FdaVariant, keyword) =>
          filterByKeyword(data.cancerType, keyword),
        Cell(props: { original: FdaVariant }) {
          return <span>{props.original.cancerType}</span>;
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        Header: (
          <div>
            <span>FDA Level of Evidence</span>
            <InfoIcon
              className={'ml-1'}
              overlay={
                <span>
                  For more information about the FDA Level of Evidence, please
                  see{' '}
                  <Linkout
                    link={FDA_LEVELS_OF_EVIDENCE_LINK}
                    className={'font-weight-bold'}
                  >
                    HERE
                  </Linkout>
                  .
                </span>
              }
            />
          </div>
        ),
        width: undefined,
        accessor: 'level',
        onFilter: (data: FdaVariant, keyword) =>
          filterByKeyword(data.level, keyword),
        sortMethod(a: string, b: string) {
          return (
            LEVEL_PRIORITY.indexOf(a.replace('Level ', '') as LEVELS) -
            LEVEL_PRIORITY.indexOf(b.replace('Level ', '') as LEVELS)
          );
        },
        Cell(props: { original: FdaVariant }) {
          return <span>FDA {props.original.level}</span>;
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

  constructor(props: any) {
    super(props);
    this.hugoSymbolQuery = props.match.params
      ? props.match.params.hugoSymbol
      : undefined;
    this.store = new AnnotationStore({
      hugoSymbolQuery: this.hugoSymbolQuery,
    });
    const queryStringsHash = QueryString.parse(window.location.hash) as {
      selectedTab: string;
    };
    if (queryStringsHash.selectedTab) {
      this.selectedTab = queryStringsHash.selectedTab;
    }

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
          const queryStrings = QueryString.parse(search) as SearchQueries;
          if (queryStrings.refGenome) {
            this.store.referenceGenomeQuery = queryStrings.refGenome;
          }
        },
        { fireImmediately: true }
      )
    );
  }

  isOncogenicMutations(alteration: string) {
    return alteration.toLowerCase() === 'oncogenic mutations';
  }

  @computed
  get fdaVariants() {
    const predefinedFdaVariants: FdaVariant[] = _.uniqBy(
      this.txAlterations.map(clinicalAlt => {
        const cancerTypesName = clinicalAlt.cancerTypes
          .map(cancerType => getCancerTypeNameFromOncoTreeType(cancerType))
          .join(', ');
        return {
          cancerType: cancerTypesName,
          level: getFdaLevel(
            clinicalAlt.level,
            this.store.hugoSymbol,
            clinicalAlt.variant.name,
            cancerTypesName
          ),
          alteration: clinicalAlt.variant,
        };
      }),
      alt => `${alt.alteration}${alt.cancerType}${alt.level}`
    );
    const hasOncogenicMutations =
      predefinedFdaVariants.filter((alteration: FdaVariant) =>
        this.isOncogenicMutations(alteration.alteration.name)
      ).length > 0;
    let fdaUpdatedVariants = predefinedFdaVariants;
    if (hasOncogenicMutations) {
      const oncogenicAlts = this.store.filteredBiologicalAlterations.filter(
        (alteration: BiologicalVariant) =>
          ['oncogenic', 'likely oncogenic', 'predicted oncogenic'].includes(
            alteration.oncogenic ? alteration.oncogenic.toLowerCase() : ''
          )
      );
      fdaUpdatedVariants = _.reduce(
        predefinedFdaVariants,
        (acc, next) => {
          if (this.isOncogenicMutations(next.alteration.name)) {
            acc.push(
              ...oncogenicAlts.map(alt => {
                return {
                  ...next,
                  alteration: alt.variant,
                };
              })
            );
          } else {
            acc.push(next);
          }
          return acc;
        },
        [] as FdaVariant[]
      );
    }

    // specially map for PICK3CA
    // we need to change the fda level
    // only list of alterations within CDx can be marked as level 2
    if (this.store.hugoSymbol === 'PIK3CA') {
      const fdaLevel2Mutations = [
        'C420R',
        'E542K',
        'E545A',
        'E545D',
        'E545G',
        'E545K',
        'Q546E',
        'Q546R',
        'H1047L',
        'H1047R',
        'H1047Y',
      ];
      fdaUpdatedVariants = fdaUpdatedVariants.map(variant => {
        return {
          ...variant,
          level: fdaLevel2Mutations.includes(variant.alteration.name)
            ? variant.level
            : 'Level 3',
        };
      });
    }
    return fdaUpdatedVariants;
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

  getTabDescription(key: TAB_KEYS) {
    if (key === TAB_KEYS.BIOLOGICAL) {
      return (
        <span>
          A list of the oncogenic and mutation effects of{' '}
          <b>all OncoKB curated</b> {this.store.hugoSymbol} alterations.
        </span>
      );
    } else if (key === TAB_KEYS.TX) {
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
    } else if (key === TAB_KEYS.DX) {
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
    } else if (key === TAB_KEYS.PX) {
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
    } else if (key === TAB_KEYS.FDA) {
      return (
        <span>
          A list of the tumor type-specific {this.store.hugoSymbol} alterations
          and the corresponding{' '}
          <Link to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA}`}>
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
  onChangeTab(selectedTabKey: string) {
    if (this.onFdaTab && selectedTabKey !== TAB_KEYS.FDA) {
      this.showModal = true;
    }
    this.selectedTab = selectedTabKey;
  }

  getTable(key: TAB_KEYS) {
    switch (key) {
      case TAB_KEYS.BIOLOGICAL:
        return (
          <GenePageTable
            data={this.store.filteredBiologicalAlterations}
            columns={this.biologicalTableColumns}
            isPending={this.store.biologicalAlterations.isPending}
          />
        );
      case TAB_KEYS.TX:
        return (
          <GenePageTable
            data={this.txAlterations}
            columns={this.clinicalTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      case TAB_KEYS.DX:
        return (
          <GenePageTable
            data={this.dxAlterations}
            columns={this.dxpxTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      case TAB_KEYS.PX:
        return (
          <GenePageTable
            data={this.pxAlterations}
            columns={this.dxpxTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      case TAB_KEYS.FDA:
        return (
          <GenePageTable
            data={this.fdaVariants}
            columns={this.fdaTableColumns}
            isPending={this.store.clinicalAlterations.isPending}
          />
        );
      default:
        return <span />;
    }
  }

  @autobind
  @action
  handleBlockedNavigation(nextLocation: Location): boolean {
    if (!this.showModal && this.onFdaTab) {
      this.showModal = true;
      this.lastLocation = nextLocation;
      return false;
    }
    return true;
  }

  @computed
  get tabs() {
    const tabs: { title: string; key: TAB_KEYS }[] = [];
    if (this.store.biologicalAlterations.result.length > 0) {
      tabs.push({
        key: TAB_KEYS.BIOLOGICAL,
        title: 'Annotated Alterations',
      });
    }
    if (this.store.clinicalAlterations.result.length > 0) {
      if (this.txAlterations.length > 0) {
        tabs.push({
          key: TAB_KEYS.TX,
          title: 'Therapeutic',
        });
      }
      if (this.dxAlterations.length > 0) {
        tabs.push({
          key: TAB_KEYS.DX,
          title: `Diagnostic`,
        });
      }
      if (this.pxAlterations.length > 0) {
        tabs.push({
          key: TAB_KEYS.PX,
          title: `Prognostic`,
        });
      }
    }
    if (this.fdaVariants.length > 0) {
      tabs.push({
        key: TAB_KEYS.FDA,
        title: 'FDA-Recognized Alterations',
      });
    }

    const tabDescriptionStyle = this.props.windowStore.isLargeScreen
      ? {
          width: '80%',
          marginBottom: '-30px',
        }
      : undefined;
    return tabs.map(tab => {
      return {
        title: tab.title,
        getContent: () => {
          return (
            <div>
              <div style={tabDescriptionStyle}>
                <div>{this.getTabDescription(tab.key)}</div>
                <ReportIssue
                  appStore={this.props.appStore}
                  annotation={{ gene: this.store.hugoSymbol }}
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
    });
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
    if (this.fdaVariants.length > 0) {
      return TAB_KEYS.FDA;
    }
    if (this.txAlterations.length > 0) {
      return TAB_KEYS.TX;
    }
    if (this.dxAlterations.length > 0) {
      return TAB_KEYS.DX;
    }
    if (this.pxAlterations.length > 0) {
      return TAB_KEYS.PX;
    }
    return TAB_KEYS.BIOLOGICAL;
  }

  @computed
  get onFdaTab() {
    return this.selectedTab === undefined
      ? this.tabDefaultActiveKey === TAB_KEYS.FDA
      : this.selectedTab === TAB_KEYS.FDA;
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

  @autobind
  @action
  confirmLeavingFdaTab() {
    if (this.lastLocation) {
      this.props.routing.history.push(
        this.lastLocation.pathname + this.lastLocation.hash
      );
    }
    this.showModal = false;
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
                            items={this.tabs}
                            transform={false}
                          />
                        </Col>
                      </Row>
                      <Modal
                        show={this.showModal}
                        onHide={this.confirmLeavingFdaTab}
                      >
                        <Modal.Body>{LEAVING_PAGE_MESSAGE}</Modal.Body>
                        <Modal.Footer>
                          <Button
                            variant="primary"
                            onClick={this.confirmLeavingFdaTab}
                          >
                            OK
                          </Button>
                        </Modal.Footer>
                      </Modal>
                      <Prompt
                        when={this.onFdaTab}
                        message={this.handleBlockedNavigation}
                      />
                    </Then>
                    <Else>
                      <LoadingIndicator
                        size={'big'}
                        center={true}
                        isLoading={this.store.gene.isPending}
                      />
                    </Else>
                  </If>
                )}
              </Then>
              <Else>
                <LoadingIndicator
                  size={'big'}
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
