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
  getCancerTypeNameFromOncoTreeType,
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
import { TABLE_COLUMN_KEY } from 'app/config/constants';
import { ClinicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { AlterationPageLink } from 'app/shared/utils/UrlUtils';
import AppStore from 'app/store/AppStore';
import TableWithSearchBox from 'app/components/tableWithSearchBox/TableWithSearchBox';

enum GENE_TYPE_DESC {
  ONCOGENE = 'Oncogene',
  TUMOR_SUPPRESSOR = 'Tumor Suppressor'
}

const getGeneTypeSentence = (oncogene: boolean, tsg: boolean) => {
  const geneTypes = [];
  if (oncogene) {
    geneTypes.push(GENE_TYPE_DESC.ONCOGENE);
  } else if (tsg) {
    return geneTypes.push(GENE_TYPE_DESC.TUMOR_SUPPRESSOR);
  }
  return geneTypes.join(', ');
};

const getHighestLevelStrings = (highestSensitiveLevel: string | undefined, highestResistanceLevel: string | undefined) => {
  const levels: React.ReactNode[] = [];
  if (highestSensitiveLevel) {
    const level = levelOfEvidence2Level(highestSensitiveLevel);
    levels.push(
      <span className={`oncokb level-${level}`} key="highestSensitiveLevel">
        Level {level}
      </span>
    );
  }
  if (highestResistanceLevel) {
    const level = levelOfEvidence2Level(highestResistanceLevel);
    levels.push(
      <span className={`oncokb level-${level}`} key="highestResistanceLevel">
        Level {level}
      </span>
    );
  }
  return <>{reduceJoin(levels, ', ')}</>;
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
        <div className={styles.highlightGeneInfo}>
          <b>{getGeneTypeSentence(gene.oncogene, gene.tsg)}</b>
        </div>
      )
    });
  }

  // highest LoE
  if (props.highestResistanceLevel || props.highestSensitiveLevel) {
    info.push({
      key: 'loe',
      element: (
        <div className={styles.highlightGeneInfo}>
          <b>Highest level of evidence: {getHighestLevelStrings(props.highestSensitiveLevel, props.highestResistanceLevel)}</b>
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
      <Button className={styles.geneAdditionalInfoButton} variant="link" href={`https://www.ncbi.nlm.nih.gov/gene/${gene.entrezGeneId}`}>
        {gene.entrezGeneId}
      </Button>
    </span>
  ];
  if (gene.curatedIsoform) {
    additionalInfo.push(
      <span key="isoform">
        Isoform:{' '}
        <Button className={styles.geneAdditionalInfoButton} variant="link" href={`https://www.ensembl.org/id/${gene.curatedIsoform}`}>
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
        <i>{`${props.show ? 'Hide' : 'Show'} ${props.hugoSymbol} background`}</i>
        <i className={`fa ${props.show ? 'fa-arrow-circle-o-up' : 'fa-arrow-circle-o-down'} ml-2`} />
      </div>
      {props.show ? <div>{props.geneBackground}</div> : undefined}
    </div>
  );
};

@inject('appStore')
@observer
export default class GenePage extends React.Component<{ appStore: AppStore }, {}> {
  @observable hugoSymbol: string;
  @observable alteration: string;
  @observable showGeneBackground = false;

  private store: AnnotationStore;

  private clinicalTableColumns = [
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATION),
      Cell: (props: { original: ClinicalVariant }) => {
        return <AlterationPageLink hugoSymbol={this.hugoSymbol} alteration={props.original.variant.name} />;
      }
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.TUMOR_TYPE),
      Cell: (props: { original: ClinicalVariant }) => {
        return <span>{getCancerTypeNameFromOncoTreeType(props.original.cancerType)}</span>;
      }
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
      Cell: (props: { original: ClinicalVariant }) => {
        return <span>{reduceJoin(props.original.drug, <br />)}</span>;
      }
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
      accessor: 'level',
      Cell: (props: { original: ClinicalVariant }) => {
        return <OncoKBLevelIcon level={props.original.level} />;
      }
    },
    {
      ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
      Cell: (props: { original: ClinicalVariant }) => {
        const numOfReferences = props.original.drugAbstracts.length + props.original.drugPmids.length;
        return `${numOfReferences} ${pluralize('reference', numOfReferences)}`;
      }
    }
  ];

  constructor(props: any) {
    super(props);
    this.hugoSymbol = props.match.params ? props.match.params.hugoSymbol : undefined;
    this.store = new AnnotationStore({
      hugoSymbol: this.hugoSymbol,
      alteration: this.alteration
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
        <TableWithSearchBox
          data={this.store.clinicalAlterations.result}
          columns={this.clinicalTableColumns}
          isLoading={this.store.clinicalAlterations.isPending}
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
        title: `Clinically Relevant ${pluralize('Alteration', this.store.clinicalAlterations.result.length)} (${
          this.store.clinicalAlterations.result.length
        })`
      });
    }
    if (this.store.biologicalAlterations.result.length > 0) {
      tabs.push({
        key: TAB_KEYS.BIOLOGICAL,
        title: `All Annotated ${pluralize('Alteration', this.store.biologicalAlterations.result.length)} (${
          this.store.biologicalAlterations.result.length
        })`
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
    return this.store.clinicalAlterations.result.length > 0 ? TAB_KEYS.CLINICAL : TAB_KEYS.BIOLOGICAL;
  }

  render() {
    return (
      <If condition={!!this.hugoSymbol}>
        <Then>
          <If condition={this.pageShouldBeRendered}>
            <Then>
              <Row>
                <Col lg={6} xs={12}>
                  <div className="">
                    <GeneInfo
                      gene={this.store.gene.result!}
                      highestSensitiveLevel={this.store.geneNumber.result.highestSensitiveLevel}
                      highestResistanceLevel={this.store.geneNumber.result.highestResistanceLevel}
                    />
                    {this.store.geneSummary.result ? <div className="mt-2">{this.store.geneSummary.result}</div> : undefined}
                    {this.store.geneBackground.result ? (
                      <GeneBackground
                        className="mt-2"
                        show={this.showGeneBackground}
                        hugoSymbol={this.hugoSymbol}
                        geneBackground={this.store.geneBackground.result}
                        onClick={this.toggleGeneBackground}
                      />
                    ) : (
                      undefined
                    )}
                  </div>
                </Col>
                <Col lg={6} xs={12} className={'d-flex flex-column align-items-center'}>
                  <div>
                    <b>Cancer Types with {this.hugoSymbol} Mutations</b>
                    <DefaultTooltip
                      overlay={() => (
                        <div style={{ maxWidth: 300 }}>
                          Currently, the mutation frequency does not take into account copy number changes, chromosomal translocations or
                          cancer types with fewer than 50 samples in{' '}
                          <a target="_blank" href="http://www.cbioportal.org/study?id=msk_impact_2017#summary">
                            MSK-IMPACT Clinical Sequencing Cohort
                          </a>{' '}
                          (
                          <a href="https://www.ncbi.nlm.nih.gov/pubmed/28481359" target="_blank">
                            Zehir et al., Nature Medicine, 2017
                          </a>
                          )
                        </div>
                      )}
                    >
                      <i className="fa fa-question-circle-o ml-2" />
                    </DefaultTooltip>
                  </div>
                  <BarChart data={this.store.barChartData} width={500} height={300} filters={[]} />
                </Col>
              </Row>
              <Row>
                <Col>{/*<LollipopPlot />*/}</Col>
              </Row>
              <Row>
                <Col>
                  <Tabs items={this.tabs} transform={false} />
                </Col>
              </Row>
            </Then>
            <Else>
              <LoadingIndicator size={'big'} center={true} isLoading={this.store.gene.isPending || this.store.geneNumber.isPending} />
            </Else>
          </If>
        </Then>
        <Else>
          <Redirect to={'/'} />
        </Else>
      </If>
    );
  }
}
