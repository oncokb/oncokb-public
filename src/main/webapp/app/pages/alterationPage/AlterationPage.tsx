import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore, TherapeuticImplication } from 'app/store/AnnotationStore';
import { computed, action, IReactionDisposer, reaction } from 'mobx';
import { Col, Row } from 'react-bootstrap';
import AppStore from 'app/store/AppStore';
import _ from 'lodash';
import Select from 'react-select';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import { DEFAULT_MARGIN_BOTTOM_SM, DEFAULT_MARGIN_TOP_LG, TABLE_COLUMN_KEY } from 'app/config/constants';
import OncoKBTable, { SearchColumn } from 'app/components/oncokbTable/OncoKBTable';
import { getDefaultColumnDefinition, reduceJoin } from 'app/shared/utils/Utils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import { CitationTooltip } from 'app/components/CitationTooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { RouterStore } from 'mobx-react-router';
import { getHighestLevelStrings } from '../genePage/GenePage';

enum SummaryKey {
  GENE_SUMMARY = 'geneSummary',
  ALTERATION_SUMMARY = 'variantSummary',
  TUMOR_TYPE_SUMMARY = 'tumorTypeSummary',
  DIAGNOSTIC_SUMMARY = 'diagnosticSummary',
  PROGNOSTIC_SUMMARY = 'prognosticSummary'
}

const SUMMARY_TITLE = {
  [SummaryKey.GENE_SUMMARY]: 'Gene Summary',
  [SummaryKey.ALTERATION_SUMMARY]: 'Alteration Summary',
  [SummaryKey.TUMOR_TYPE_SUMMARY]: 'Tumor Type Summary',
  [SummaryKey.DIAGNOSTIC_SUMMARY]: 'Diagnostic Summary',
  [SummaryKey.PROGNOSTIC_SUMMARY]: 'Prognostic Summary'
};

const AlterationInfo: React.FunctionComponent<{
  oncogenicity: string;
  mutationEffect: string;
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
}> = props => {
  const separator = <span className="mx-1">·</span>;
  const content = [];
  if (props.oncogenicity) {
    content.push(<span key="oncogenicity">{props.oncogenicity}</span>);
  }
  if (props.mutationEffect) {
    content.push(<span key="mutationEffect">{props.mutationEffect}</span>);
  }
  if (props.highestSensitiveLevel || props.highestResistanceLevel) {
    content.push(getHighestLevelStrings(props.highestSensitiveLevel, props.highestResistanceLevel, separator));
  }
  return (
    <div className="mt-2">
      <b>{reduceJoin(content, separator)}</b>
    </div>
  );
};

@inject('appStore', 'routing')
@observer
export default class GenePage extends React.Component<{ appStore: AppStore; routing: RouterStore }, {}> {
  private store: AnnotationStore;

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: any) {
    super(props);
    if (props.match.params) {
      this.store = new AnnotationStore({
        hugoSymbolQuery: props.match.params.hugoSymbol,
        alterationQuery: props.match.params.alteration,
        tumorTypeQuery: props.match.params.tumorType
      });
    }

    this.reactions.push(
      reaction(
        () => this.store.tumorTypeQuery,
        newTumorType => {
          const tumorTypeSection = this.store.tumorTypeQuery ? `/${this.store.tumorTypeQuery}` : '';
          this.props.routing.history.replace(`/gene/${this.store.hugoSymbol}/${this.store.alterationQuery}${tumorTypeSection}`);
        }
      )
    );
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
  get tumorTypeSelectValue() {
    if (this.store.tumorTypeQuery) {
      const matchedSubtype = _.find(this.store.allSubtype.result, tumorType => tumorType.code === this.store.tumorTypeQuery);
      if (matchedSubtype) {
        return {
          label: matchedSubtype.name,
          value: matchedSubtype.code
        };
      } else {
        return {
          label: this.store.tumorTypeQuery,
          value: this.store.tumorTypeQuery
        };
      }
    } else {
      return null;
    }
  }

  @autobind
  @action
  updateTumorTypeQuery(selectedOption: any) {
    this.store.tumorTypeQuery = selectedOption ? selectedOption.value : '';
  }

  @computed
  get summaries() {
    const orderedSummaries = [SummaryKey.GENE_SUMMARY, SummaryKey.ALTERATION_SUMMARY];

    if (this.store.tumorTypeQuery) {
      orderedSummaries.push(...[SummaryKey.TUMOR_TYPE_SUMMARY, SummaryKey.DIAGNOSTIC_SUMMARY, SummaryKey.PROGNOSTIC_SUMMARY]);
    } else {
      orderedSummaries.push(SummaryKey.DIAGNOSTIC_SUMMARY);
    }

    return _.reduce(
      orderedSummaries,
      (acc, next) => {
        if (this.store.annotationResult.result[next]) {
          acc.push({
            key: next,
            title: SUMMARY_TITLE[next],
            content: this.store.annotationResult.result[next]
          });
        }
        return acc;
      },
      [] as { key: string; title: string; content: string }[]
    );
  }

  @computed
  get therapeuticTableColumns(): SearchColumn<TherapeuticImplication>[] {
    return [
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.LEVEL)
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.ALTERATIONS)
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.DRUGS)
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.EVIDENCE_CANCER_TYPE)
      },
      {
        ...getDefaultColumnDefinition(TABLE_COLUMN_KEY.CITATIONS),
        Cell: (props: { original: TherapeuticImplication }) => {
          const numOfReferences = props.original.citations.abstracts.length + props.original.citations.pmids.length;
          return (
            <DefaultTooltip
              overlay={() => <CitationTooltip pmids={props.original.citations.pmids} abstracts={props.original.citations.abstracts} />}
            >
              <span>{numOfReferences}</span>
            </DefaultTooltip>
          );
        }
      }
    ];
  }

  formatGroupLabel(data: any) {
    return <span>{data.label}</span>;
  }

  componentWillUnmount(): void {
    for (const reactionItem of this.reactions) {
      reactionItem();
    }
    this.store.destroy();
  }

  render() {
    return (
      <>
        <div className="d-flex align-items-center">
          <span style={{ fontSize: '2rem' }}>
            <GenePageLink hugoSymbol={this.store.hugoSymbol} highlightContent={false} />
            {` ${this.store.alterationQuery}`}
          </span>
          <div style={{ width: 300 }}>
            <Select
              className={'ml-2'}
              value={this.tumorTypeSelectValue}
              placeholder="Search Tumor Type"
              options={this.store.allTumorTypesOptions.result}
              formatGroupLabel={this.formatGroupLabel}
              isClearable={true}
              onChange={(selectedOption: any) => this.updateTumorTypeQuery(selectedOption)}
            />
          </div>
        </div>
        {this.store.annotationResult.isPending ? (
          <LoadingIndicator isLoading={true} centerRelativeToContainer={true} />
        ) : (
          <>
            <AlterationInfo
              oncogenicity={this.store.annotationResult.result.oncogenic}
              mutationEffect={this.store.annotationResult.result.mutationEffect.knownEffect}
              highestSensitiveLevel={this.store.annotationResult.result.highestSensitiveLevel}
              highestResistanceLevel={this.store.annotationResult.result.highestResistanceLevel}
            />
            {this.summaries.length > 0 ? <h3>Summary</h3> : null}
            {this.summaries.map(summary => {
              return (
                <Row key={summary.key} className={DEFAULT_MARGIN_BOTTOM_SM}>
                  <Col xs={12}>
                    <div>
                      <h6 style={{ color: 'grey' }}>{summary.title}</h6>
                      <div style={{}}>{summary.content}</div>
                    </div>
                  </Col>
                </Row>
              );
            })}
            <Row className={DEFAULT_MARGIN_TOP_LG}>
              <Col xs={12}>
                <h3>{`${this.store.hugoSymbol} Background`}</h3>
                <div>{this.store.annotationResult.result.background}</div>
              </Col>
            </Row>
            {this.store.therapeuticImplications.length > 0 ? (
              <Row className={DEFAULT_MARGIN_TOP_LG}>
                <Col xs={12}>
                  <h3>Therapeutic Implications</h3>
                  <OncoKBTable
                    data={this.store.therapeuticImplications}
                    columns={this.therapeuticTableColumns}
                    minRows={5}
                    loading={this.store.annotationResult.isPending}
                    disableSearch={true}
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
                </Col>
              </Row>
            ) : null}
          </>
        )}
      </>
    );
  }
}
