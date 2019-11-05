import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore } from 'app/store/AnnotationStore';
import { action, computed, observable } from 'mobx';
import { Else, If, Then } from 'react-if';
import { Redirect } from 'react-router';
import { Button, Col, Row } from 'react-bootstrap';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import styles from './GenePage.module.scss';
import {
  filterByKeyword,
  getCancerTypeNameFromOncoTreeType,
  getCenterAlignStyle,
  getDefaultColumnDefinition,
  levelOfEvidence2Level,
  OncoKBLevelIcon,
  reduceJoin
} from 'app/shared/utils/Utils';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import BarChart from 'app/components/barChart/BarChart';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import pluralize from 'pluralize';
import { ReportIssue } from 'app/components/ReportIssue';
import Tabs from 'react-responsive-tabs';
import {
  SM_TABLE_FIXED_HEIGHT,
  TABLE_COLUMN_KEY,
  THRESHOLD_TABLE_FIXED_HEIGHT
} from 'app/config/constants';
import {
  BiologicalVariant,
  ClinicalVariant
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { AlterationPageLink, GenePageLink } from 'app/shared/utils/UrlUtils';
import AppStore from 'app/store/AppStore';
import OncoKBTable, {
  SearchColumn
} from 'app/components/oncokbTable/OncoKBTable';
import _ from 'lodash';
import { MskimpactLink } from 'app/components/MskimpactLink';
import { OncokbMutationMapper } from 'app/components/oncokbMutationMapper/OncokbMutationMapper';
import { CitationTooltip } from 'app/components/CitationTooltip';
import WindowStore, { IWindowSize } from 'app/store/WindowStore';
import { DataFilterType, onFilterOptionSelect } from 'react-mutation-mapper';
import { CANCER_TYPE_FILTER_ID } from 'app/components/oncokbMutationMapper/FilterUtils';

enum GENE_TYPE_DESC {
  ONCOGENE = 'Oncogene',
  TUMOR_SUPPRESSOR = 'Tumor Suppressor'
}

const getGeneTypeSentence = (oncogene: boolean, tsg: boolean) => {
  const geneTypes = [];
  if (oncogene) {
    geneTypes.push(GENE_TYPE_DESC.ONCOGENE);
  } else if (tsg) {
    geneTypes.push(GENE_TYPE_DESC.TUMOR_SUPPRESSOR);
  }
  return geneTypes.join(', ');
};

export const getHighestLevelStrings = (
  highestSensitiveLevel: string | undefined,
  highestResistanceLevel: string | undefined,
  separator: string | JSX.Element = ', '
) => {
  const levels: React.ReactNode[] = [];
  if (highestSensitiveLevel) {
    const level = levelOfEvidence2Level(highestSensitiveLevel, false);
    levels.push(
      <span className={`oncokb level-${level}`} key="highestSensitiveLevel">
        Level {level}
      </span>
    );
  }
  if (highestResistanceLevel) {
    const level = levelOfEvidence2Level(highestResistanceLevel, false);
    levels.push(
      <span className={`oncokb level-${level}`} key="highestResistanceLevel">
        Level {level}
      </span>
    );
  }
  return <>{reduceJoin(levels, separator)}</>;
};

type GeneInfoProps = {
  gene: Gene;
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
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
      )
    });
  }

  // highest LoE
  if (props.highestResistanceLevel || props.highestSensitiveLevel) {
    info.push({
      key: 'loe',
      element: (
        <div>
          <h5>
            Highest level of evidence:{' '}
            {getHighestLevelStrings(
              props.highestSensitiveLevel,
              props.highestResistanceLevel
            )}
          </h5>
        </div>
      )
    });
  }

  if (gene.geneAliases.length > 0) {
    info.push({
      key: 'aliases',
      element: <div>{`Also known as ${gene.geneAliases.join(', ')}`}</div>
    });
  }

  const additionalInfo: React.ReactNode[] = [
    <span key="geneId">
      Gene ID:{' '}
      <Button
        className={styles.geneAdditionalInfoButton}
        variant="link"
        href={`https://www.ncbi.nlm.nih.gov/gene/${gene.entrezGeneId}`}
      >
        {gene.entrezGeneId}
      </Button>
    </span>
  ];
  if (gene.curatedIsoform) {
    additionalInfo.push(
      <span key="isoform">
        Isoform:{' '}
        <Button
          className={styles.geneAdditionalInfoButton}
          variant="link"
          href={`https://www.ensembl.org/id/${gene.curatedIsoform}`}
        >
          {gene.curatedIsoform}
        </Button>
      </span>
    );
  }
  if (gene.curatedRefSeq) {
    additionalInfo.push(
      <span key="refSeq">
        RefSeq:{' '}
        <Button
          className={styles.geneAdditionalInfoButton}
          variant="link"
          href={`https://www.ncbi.nlm.nih.gov/nuccore/${gene.curatedRefSeq}`}
        >
          {gene.curatedRefSeq}
        </Button>
      </span>
    );
  }

  info.push({
    key: 'additionalInfo',
    element: <div className={styles.geneAdditionalInfo}>{additionalInfo}</div>
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
  'CLINICAL',
  'BIOLOGICAL'
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
      {props.show ? <div>{props.geneBackground}</div> : undefined}
    </div>
  );
};

@inject('appStore', 'windowStore')
@observer
export default class GenePage extends React.Component<
  { appStore: AppStore; windowStore: WindowStore },
  {}
> {
  @observable hugoSymbolQuery: string;
  @observable showGeneBackground = false;

  private store: AnnotationStore;

  @computed
  get clinicalTableColumns(): SearchColumn<ClinicalVariant>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
        onFilter: (data: ClinicalVariant, keyword) =>
          filterByKeyword(data.variant.name, keyword),
        Cell: (props: { original: ClinicalVariant }) => {
          return (
            <AlterationPageLink
              hugoSymbol={this.store.hugoSymbol}
              alteration={props.original.variant.name}
            />
          );
        }
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.TUMOR_TYPE),
        onFilter: (data: ClinicalVariant, keyword) =>
          filterByKeyword(
            getCancerTypeNameFromOncoTreeType(data.cancerType),
            keyword
          ),
        Cell(props: { original: ClinicalVariant }) {
          return (
            <span>
              {getCancerTypeNameFromOncoTreeType(props.original.cancerType)}
            </span>
          );
        }
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
        onFilter: (data: ClinicalVariant, keyword) =>
          _.some(data.drug, (drug: string) =>
            drug.toLowerCase().includes(keyword)
          ),
        Cell(props: { original: ClinicalVariant }) {
          return <span>{reduceJoin(props.original.drug, <br />)}</span>;
        }
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        accessor: 'level'
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS)
      }
    ];
  }

  @computed
  get biologicalTableColumns(): SearchColumn<BiologicalVariant>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
        onFilter: (data: BiologicalVariant, keyword) =>
          filterByKeyword(data.variant.name, keyword),
        Cell: (props: { original: BiologicalVariant }) => {
          return (
            <AlterationPageLink
              hugoSymbol={this.store.hugoSymbol}
              alteration={props.original.variant.name}
            />
          );
        }
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ONCOGENICITY),
        onFilter: (data: BiologicalVariant, keyword) =>
          filterByKeyword(data.oncogenic, keyword),
        style: getCenterAlignStyle()
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.MUTATION_EFFECT),
        onFilter: (data: BiologicalVariant, keyword) =>
          filterByKeyword(data.mutationEffect, keyword),
        style: getCenterAlignStyle()
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
        style: getCenterAlignStyle(),
        Cell(props: { original: BiologicalVariant }) {
          const numOfReferences =
            props.original.mutationEffectAbstracts.length +
            props.original.mutationEffectPmids.length;
          return (
            <DefaultTooltip
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
        }
      }
    ];
  }

  constructor(props: any) {
    super(props);
    this.hugoSymbolQuery = props.match.params
      ? props.match.params.hugoSymbol
      : undefined;
    this.store = new AnnotationStore({
      hugoSymbolQuery: this.hugoSymbolQuery
    });
  }

  @autobind
  @action
  toggleGeneBackground() {
    this.showGeneBackground = !this.showGeneBackground;
  }

  getTable(key: TAB_KEYS) {
    if (key === TAB_KEYS.CLINICAL) {
      return (
        <OncoKBTable
          data={this.store.filteredClinicalAlterations}
          columns={this.clinicalTableColumns}
          style={
            this.store.filteredBiologicalAlterations.length >
            THRESHOLD_TABLE_FIXED_HEIGHT
              ? {
                  height: SM_TABLE_FIXED_HEIGHT
                }
              : undefined
          }
          loading={this.store.clinicalAlterations.isPending}
          defaultSorted={[
            {
              id: TABLE_COLUMN_KEY.LEVEL,
              desc: false
            },
            {
              id: TABLE_COLUMN_KEY.ALTERATION,
              desc: false
            }
          ]}
        />
      );
    } else if (key === TAB_KEYS.BIOLOGICAL) {
      return (
        <OncoKBTable
          data={this.store.filteredBiologicalAlterations}
          columns={this.biologicalTableColumns}
          style={
            this.store.filteredBiologicalAlterations.length >
            THRESHOLD_TABLE_FIXED_HEIGHT
              ? {
                  height: SM_TABLE_FIXED_HEIGHT
                }
              : undefined
          }
          loading={this.store.biologicalAlterations.isPending}
          defaultSorted={[
            {
              id: TABLE_COLUMN_KEY.ONCOGENICITY,
              desc: false
            },
            {
              id: TABLE_COLUMN_KEY.ALTERATION,
              desc: false
            }
          ]}
        />
      );
    }
    return <span />;
  }

  getTabContent(key: TAB_KEYS) {
    return (
      <div>
        <ReportIssue />
        {this.getTable(key)}
      </div>
    );
  }

  @computed
  get tabs() {
    const tabs: { title: string; key: TAB_KEYS }[] = [];
    if (this.store.clinicalAlterations.result.length > 0) {
      tabs.push({
        key: TAB_KEYS.CLINICAL,
        title: `Clinically Relevant ${pluralize(
          'Alteration',
          this.store.clinicalAlterations.result.length
        )} (${this.store.filteredClinicalAlterations.length})`
      });
    }
    if (this.store.biologicalAlterations.result.length > 0) {
      tabs.push({
        key: TAB_KEYS.BIOLOGICAL,
        title: `All Annotated ${pluralize(
          'Alteration',
          this.store.biologicalAlterations.result.length
        )} (${this.store.filteredBiologicalAlterations.length})`
      });
    }
    return tabs.map(tab => {
      return {
        title: tab.title,
        getContent: () => this.getTabContent(tab.key),
        /* Optional parameters */
        key: tab.key,
        tabClassName: styles.tab,
        panelClassName: styles.panel
      };
    });
  }

  @computed
  get pageShouldBeRendered() {
    return (
      this.store.gene.isComplete &&
      this.store.geneNumber.isComplete &&
      this.store.clinicalAlterations.isComplete &&
      this.store.biologicalAlterations.isComplete
    );
  }

  @computed
  get tabDefaultActiveKey() {
    return this.store.clinicalAlterations.result.length > 0
      ? TAB_KEYS.CLINICAL
      : TAB_KEYS.BIOLOGICAL;
  }

  @computed
  get genePanelClass() {
    if (this.store.barChartData.length > 0) {
      return {
        xl: 7,
        lg: 6,
        xs: 12
      };
    } else {
      return {
        xs: 12
      };
    }
  }
  componentWillUnmount(): void {
    this.store.destroy();
  }

  @computed
  get windowWrapper() {
    const MAX_WIDTH = 1442;
    if (this.props.windowStore.size.width > MAX_WIDTH) {
      const windowSize: IWindowSize = {
        width: MAX_WIDTH,
        height: this.props.windowStore.size.height
      };
      return {size: windowSize};
    }
    return this.props.windowStore;
  }

  render() {
    return (
      <If condition={!!this.hugoSymbolQuery}>
        <Then>
          {this.pageShouldBeRendered ? (
            <>
              <Row>
                <Col {...this.genePanelClass}>
                  <div className="">
                    <h2>{this.store.hugoSymbol}</h2>
                    <GeneInfo
                      gene={this.store.gene.result}
                      highestSensitiveLevel={
                        this.store.geneNumber.result.highestSensitiveLevel
                      }
                      highestResistanceLevel={
                        this.store.geneNumber.result.highestResistanceLevel
                      }
                    />
                    {this.store.geneSummary.result ? (
                      <div className="mt-2">
                        {this.store.geneSummary.result}
                      </div>
                    ) : (
                      undefined
                    )}
                    {this.store.geneBackground.result ? (
                      <GeneBackground
                        className="mt-2"
                        show={this.showGeneBackground}
                        hugoSymbol={this.store.hugoSymbol}
                        geneBackground={this.store.geneBackground.result}
                        onClick={this.toggleGeneBackground}
                      />
                    ) : (
                      undefined
                    )}
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
                      <b>Cancer Types with {this.store.hugoSymbol} Mutations</b>
                      <DefaultTooltip
                        overlay={() => (
                          <div style={{ maxWidth: 300 }}>
                            Currently, the mutation frequency does not take into
                            account copy number changes, chromosomal
                            translocations or cancer types with fewer than 50
                            samples in <MskimpactLink />
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
                              this.store.mutationMapperStore.result.dataStore,
                              DataFilterType.CANCER_TYPE,
                              CANCER_TYPE_FILTER_ID
                            )
                          : undefined
                      }
                    />
                  </Col>
                ) : null}
              </Row>
              <Row className={'mt-5'}>
                <Col xs={12}>
                  <h6>
                    Annotated Mutation Distribution in <MskimpactLink />
                  </h6>
                </Col>
                <Col xs={12}>
                  <OncokbMutationMapper
                    {...this.store.mutationMapperProps.result}
                    store={this.store.mutationMapperStore.result}
                    oncogenicities={this.store.uniqOncogenicity}
                    windowWrapper={this.windowWrapper}
                  />
                </Col>
              </Row>
              <Row className={'mt-2'}>
                <Col>
                  <Tabs items={this.tabs} transform={false} />
                </Col>
              </Row>
            </>
          ) : (
            <LoadingIndicator
              size={'big'}
              center={true}
              isLoading={
                this.store.gene.isPending || this.store.geneNumber.isPending
              }
            />
          )}
        </Then>
        <Else>
          <Redirect to={'/'} />
        </Else>
      </If>
    );
  }
}
