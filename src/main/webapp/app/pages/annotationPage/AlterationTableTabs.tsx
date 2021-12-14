import React from 'react';
import Tabs from 'react-responsive-tabs';
import { inject, observer } from 'mobx-react';
import autobind from 'autobind-decorator';
import { action, observable, computed } from 'mobx';
import { Link } from 'react-router-dom';
import { DefaultTooltip } from 'cbioportal-frontend-commons';

import { ReportIssue } from 'app/components/ReportIssue';
import styles from 'app/pages/genePage/GenePage.module.scss';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  ANNOTATION_PAGE_TAB_NAMES,
  DEFAULT_MESSAGE_HEME_ONLY_DX,
  DEFAULT_MESSAGE_HEME_ONLY_PX,
  LEVEL_PRIORITY,
  LEVEL_TYPES,
  LEVELS,
  PAGE_ROUTE,
  REFERENCE_GENOME,
  TABLE_COLUMN_KEY,
} from 'app/config/constants';
import { TherapeuticImplication } from 'app/store/AnnotationStore';
import { LevelOfEvidencePageLink } from 'app/shared/links/LevelOfEvidencePageLink';
import { Version } from 'app/pages/LevelOfEvidencePage';
import {
  BiologicalVariant,
  EnsemblGene,
  FdaAlteration,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { GenePageTable } from 'app/pages/genePage/GenePageTable';
import AppStore from 'app/store/AppStore';
import { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import {
  filterByKeyword,
  getDefaultColumnDefinition,
  IAlteration,
} from 'app/shared/utils/Utils';
import { AlterationPageLink } from 'app/shared/utils/UrlUtils';
import { Citations } from 'app/shared/api/generated/OncoKbAPI';
import { CitationTooltip } from 'app/components/CitationTooltip';
import { getTabDefaultActiveKey } from 'app/shared/utils/TempAnnotationUtils';
import WindowStore from 'app/store/WindowStore';
import InfoIcon from 'app/shared/icons/InfoIcon';

export type Column = {
  key: ANNOTATION_PAGE_TAB_KEYS;
};
export interface IEvidenceTableTabProps {
  hugoSymbol: string;
  ensemblGenes?: EnsemblGene[];
  alteration?: IAlteration;
  cancerType?: string;
  biological: BiologicalVariant[];
  tx: TherapeuticImplication[];
  dx: TherapeuticImplication[];
  px: TherapeuticImplication[];
  fda: FdaAlteration[];
  selectedTab?: ANNOTATION_PAGE_TAB_KEYS;
  onChangeTab?: (
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) => void;
  appStore?: AppStore; // it will be injected directly
  windowStore?: WindowStore; // it will be injected directly
}

@inject('windowStore', 'appStore')
@observer
export default class AlterationTableTabs extends React.Component<
  IEvidenceTableTabProps,
  any
> {
  @observable selectedTab: ANNOTATION_PAGE_TAB_KEYS;
  @observable defaultSelectedTab: ANNOTATION_PAGE_TAB_KEYS =
    ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL;

  constructor(props: any) {
    super(props);
    if (props.selectedTab) {
      this.selectedTab = props.selectedTab;
      this.defaultSelectedTab = props.selectedTab;
    }
  }

  getTabDescription(key: ANNOTATION_PAGE_TAB_KEYS) {
    if (key === ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL) {
      return (
        <span>
          A list of the oncogenic and mutation effects of{' '}
          <b>all OncoKB curated</b> {this.props.hugoSymbol} alterations.
        </span>
      );
    } else if (key === ANNOTATION_PAGE_TAB_KEYS.TX) {
      return (
        <span>
          A list of the cancer type-specific {this.props.hugoSymbol} alterations
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
          A list of diagnostic {this.props.hugoSymbol} alterations and the
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
          A list of tumor-type specific prognostic {this.props.hugoSymbol}{' '}
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
          A list of the tumor type-specific {this.props.hugoSymbol} alterations
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

  @computed
  get tabDefaultActiveKey() {
    return getTabDefaultActiveKey(
      this.props.tx.length > 0,
      this.props.dx.length > 0,
      this.props.px.length > 0,
      this.props.fda.length > 0,
      this.defaultSelectedTab
    );
  }

  @autobind
  @action
  onChangeTab(newTabKey: ANNOTATION_PAGE_TAB_KEYS) {
    if (this.props.onChangeTab) {
      this.props.onChangeTab(this.selectedTab, newTabKey);
    }
    this.selectedTab = newTabKey;
  }

  @computed
  get tabDescriptionStyle() {
    return this.props.windowStore && this.props.windowStore.isLargeScreen
      ? {
          width: '80%',
          marginBottom: '-30px',
        }
      : undefined;
  }

  @computed
  get tabs() {
    const tabs: { title: string; key: ANNOTATION_PAGE_TAB_KEYS }[] = [];
    if (this.props.biological.length > 0) {
      tabs.push({
        key: ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL,
        title: `${
          ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL]
        }`,
      });
    }
    if (this.props.tx.length > 0) {
      tabs.push({
        key: ANNOTATION_PAGE_TAB_KEYS.TX,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.TX]}`,
      });
    }
    if (this.props.dx.length > 0) {
      tabs.push({
        key: ANNOTATION_PAGE_TAB_KEYS.DX,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.DX]}`,
      });
    }
    if (this.props.px.length > 0) {
      tabs.push({
        key: ANNOTATION_PAGE_TAB_KEYS.PX,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.PX]}`,
      });
    }
    if (this.props.fda.length > 0) {
      tabs.push({
        key: ANNOTATION_PAGE_TAB_KEYS.FDA,
        title: `${ANNOTATION_PAGE_TAB_NAMES[ANNOTATION_PAGE_TAB_KEYS.FDA]}`,
      });
    }
    return tabs.map(tab => {
      return {
        title: tab.title,
        getContent: () => {
          return (
            <div>
              <div style={this.tabDescriptionStyle}>
                <div>{this.getTabDescription(tab.key)}</div>
                <ReportIssue
                  appStore={this.props.appStore!}
                  annotation={{
                    gene: this.props.hugoSymbol,
                    alteration: this.props.alteration?.name,
                    cancerType: this.props.cancerType,
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
    });
  }

  @computed
  get therapeuticTableColumns(): SearchColumn<TherapeuticImplication>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.level, keyword),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATIONS),
        Cell(props: { original: TherapeuticImplication }) {
          return props.original.alterationsView;
        },
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.alterations, keyword),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE),
        Cell(props: { original: TherapeuticImplication }) {
          return props.original.cancerTypesView;
        },
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.cancerTypes, keyword),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.drugs, keyword),
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
                hugoSymbol={this.props.hugoSymbol}
                ensemblGenes={this.props.ensemblGenes}
                alteration={{
                  alteration: props.original.variant.alteration,
                  name: props.original.variant.name,
                }}
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
  get dxpxTableColumns(): SearchColumn<TherapeuticImplication>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.level, keyword),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATIONS),
        Cell(props: { original: TherapeuticImplication }) {
          return props.original.alterationsView;
        },
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.alterations, keyword),
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE),
        onFilter: (data: TherapeuticImplication, keyword) =>
          filterByKeyword(data.cancerTypes, keyword),
        Cell(props: { original: TherapeuticImplication }) {
          return props.original.cancerTypesView;
        },
        minWidth: 250,
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
              ensemblGenes={this.props.ensemblGenes}
              alteration={{
                alteration: props.original.alteration.alteration,
                name: props.original.alteration.name,
              }}
              hashQueries={{ tab: ANNOTATION_PAGE_TAB_KEYS.FDA }}
              onClick={() => {
                this.props.appStore!.toFdaRecognizedContent = true;
              }}
            />
          );
        },
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE),
        accessor: 'cancerType',
        width: 400,
        Header: <span>Cancer Type</span>,
        onFilter: (data: FdaAlteration, keyword: string) =>
          filterByKeyword(data.cancerType, keyword),
        Cell: (props: { original: FdaAlteration }) => {
          return (
            <AlterationPageLink
              hugoSymbol={this.props.hugoSymbol}
              alteration={{
                alteration: props.original.alteration.alteration,
                name: props.original.alteration.name,
              }}
              alterationRefGenomes={
                props.original.alteration.referenceGenomes as REFERENCE_GENOME[]
              }
              hashQueries={{ tab: ANNOTATION_PAGE_TAB_KEYS.FDA }}
              cancerType={props.original.cancerType}
              onClick={() => {
                this.props.appStore!.toFdaRecognizedContent = true;
              }}
            >
              {props.original.cancerType}
            </AlterationPageLink>
          );
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
                  <Link
                    to={`${PAGE_ROUTE.LEVELS}#version=${Version.FDA_NGS}`}
                    className={'font-bold'}
                  >
                    HERE
                  </Link>
                  .
                </span>
              }
            />
          </div>
        ),
        width: undefined,
        accessor: 'level',
        onFilter: (data: FdaAlteration, keyword: string) =>
          filterByKeyword(data.level, keyword),
        sortMethod(a: string, b: string) {
          return (
            LEVEL_PRIORITY.indexOf(a.replace('Level ', '') as LEVELS) -
            LEVEL_PRIORITY.indexOf(b.replace('Level ', '') as LEVELS)
          );
        },
        Cell(props: { original: FdaAlteration }) {
          return (
            <span>
              FDA Level {props.original.level.toString().replace('FDAx', '')}
            </span>
          );
        },
      },
    ];
  }

  @action
  getTable(key: ANNOTATION_PAGE_TAB_KEYS) {
    switch (key) {
      case ANNOTATION_PAGE_TAB_KEYS.BIOLOGICAL:
        return (
          <GenePageTable
            data={this.props.biological}
            columns={this.biologicalTableColumns}
            isPending={false}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.TX:
        return (
          <GenePageTable
            data={this.props.tx}
            columns={this.therapeuticTableColumns}
            isPending={false}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.DX:
        return (
          <GenePageTable
            data={this.props.dx}
            columns={this.dxpxTableColumns}
            isPending={false}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.PX:
        return (
          <GenePageTable
            data={this.props.px}
            columns={this.dxpxTableColumns}
            isPending={false}
          />
        );
      case ANNOTATION_PAGE_TAB_KEYS.FDA:
        return (
          <GenePageTable
            data={this.props.fda}
            columns={this.fdaTableColumns}
            isPending={false}
          />
        );
      default:
        return <span />;
    }
  }

  render() {
    return (
      <Tabs
        selectedTabKey={
          this.selectedTab ? this.selectedTab : this.tabDefaultActiveKey
        }
        onChange={this.onChangeTab}
        items={this.tabs}
        transform={false}
      />
    );
  }
}
