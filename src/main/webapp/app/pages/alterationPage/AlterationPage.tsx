import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  AnnotationStore,
  TherapeuticImplication
} from 'app/store/AnnotationStore';
import { computed, action, IReactionDisposer, reaction } from 'mobx';
import { Col, Row } from 'react-bootstrap';
import AppStore from 'app/store/AppStore';
import _ from 'lodash';
import Select from 'react-select';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import {
  DEFAULT_MARGIN_BOTTOM_LG,
  TABLE_COLUMN_KEY,
  THRESHOLD_ALTERATION_PAGE_TABLE_FIXED_HEIGHT
} from 'app/config/constants';
import OncoKBTable, {
  SearchColumn
} from 'app/components/oncokbTable/OncoKBTable';
import {
  getDefaultColumnDefinition,
  OncoKBOncogenicityIcon,
  reduceJoin
} from 'app/shared/utils/Utils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import { CitationTooltip } from 'app/components/CitationTooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { RouterStore } from 'mobx-react-router';
import { getHighestLevelStrings } from '../genePage/GenePage';
import styles from './AlterationPage.module.scss';
import classnames from 'classnames';
import SmallPageContainer from 'app/components/SmallPageContainer';
import InfoIcon from 'app/shared/icons/InfoIcon';
import DocumentTitle from 'react-document-title';

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
  isVus: boolean;
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
}> = props => {
  const separator = <span className="mx-1">·</span>;
  const content = [];
  if (props.oncogenicity) {
    content.push(
      <>
        <span key="oncogenicity">{props.oncogenicity}</span>
        <OncoKBOncogenicityIcon
          oncogenicity={props.oncogenicity}
          isVus={props.isVus}
        />
      </>
    );
  }
  if (props.mutationEffect) {
    content.push(<span key="mutationEffect">{props.mutationEffect}</span>);
  }
  if (props.highestSensitiveLevel || props.highestResistanceLevel) {
    content.push(
      getHighestLevelStrings(
        props.highestSensitiveLevel,
        props.highestResistanceLevel,
        separator
      )
    );
  }
  return (
    <div className="mt-2">
      <h5 className={'d-flex align-items-center'}>
        {reduceJoin(content, separator)}
      </h5>
    </div>
  );
};

@inject('appStore', 'routing')
@observer
export default class GenePage extends React.Component<
  { appStore: AppStore; routing: RouterStore },
  {}
> {
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
          let tumorTypeSection = this.store.tumorTypeQuery.replace('/', '%2F');
          tumorTypeSection = tumorTypeSection ? `/${tumorTypeSection}` : '';
          this.props.routing.history.replace(
            `/gene/${this.store.hugoSymbol}/${this.store.alterationQuery}${tumorTypeSection}`
          );
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
      const matchedSubtype = _.find(
        this.store.allSubtype.result,
        tumorType => tumorType.code === this.store.tumorTypeQuery
      );
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
  get alterationSummaries() {
    const orderedSummaries = [
      SummaryKey.GENE_SUMMARY,
      SummaryKey.ALTERATION_SUMMARY
    ];
    return this.getSummaries(orderedSummaries);
  }

  @computed
  get tumorTypeSummaries() {
    const orderedSummaries = this.store.tumorTypeQuery
      ? [
          SummaryKey.TUMOR_TYPE_SUMMARY,
          SummaryKey.DIAGNOSTIC_SUMMARY,
          SummaryKey.PROGNOSTIC_SUMMARY
        ]
      : [];
    return this.getSummaries(orderedSummaries);
  }

  getSummaries(orderedSummaries: string[]) {
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
        Cell(props: { original: TherapeuticImplication }) {
          const numOfReferences =
            props.original.citations.abstracts.length +
            props.original.citations.pmids.length;
          return (
            <DefaultTooltip
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
        }
      }
    ];
  }

  @computed
  get documentTitle() {
    const content = [];
    if (this.store.hugoSymbol) {
      content.push(`Gene: ${this.store.hugoSymbol}`);
    }
    if (this.store.alterationQuery) {
      content.push(`Alteration: ${this.store.alterationQuery}`);
    }
    if (this.store.tumorTypeQuery) {
      content.push(`Tumor Type: ${this.store.tumorTypeQuery}`);
    }
    return content.join(', ');
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
      <DocumentTitle title={this.documentTitle}>
        <>
          <h2 className={'d-flex align-items-center'}>
            <GenePageLink
              hugoSymbol={this.store.hugoSymbol}
              highlightContent={false}
            />
            <span className={'ml-2'}>{` ${this.store.alterationQuery}`}</span>
          </h2>
          <AlterationInfo
            oncogenicity={this.store.annotationResult.result.oncogenic}
            mutationEffect={
              this.store.annotationResult.result.mutationEffect.knownEffect
            }
            isVus={this.store.annotationResult.result.vus}
            highestSensitiveLevel={
              this.store.annotationResult.result.highestSensitiveLevel
            }
            highestResistanceLevel={
              this.store.annotationResult.result.highestResistanceLevel
            }
          />
          <Row>
            <Col>
              {this.alterationSummaries.map(summary => {
                return (
                  <div className={DEFAULT_MARGIN_BOTTOM_LG}>
                    {summary.content}
                  </div>
                );
              })}
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="d-flex align-items-center">
                <span
                  className={classnames(
                    DEFAULT_MARGIN_BOTTOM_LG,
                    styles.headerTumorTypeSelection,
                    'mr-2'
                  )}
                >
                  <Select
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        height: '30px',
                        'min-height': '30px'
                      }),
                      dropdownIndicator: base => ({
                        ...base,
                        padding: 4
                      }),
                      clearIndicator: base => ({
                        ...base,
                        padding: 4
                      }),
                      valueContainer: base => ({
                        ...base,
                        padding: '0px 6px'
                      }),
                      input: base => ({
                        ...base,
                        margin: 0,
                        padding: 0
                      })
                    }}
                    value={this.tumorTypeSelectValue}
                    placeholder="Select a tumor type"
                    options={this.store.allTumorTypesOptions.result}
                    formatGroupLabel={this.formatGroupLabel}
                    isClearable={true}
                    onChange={(selectedOption: any) =>
                      this.updateTumorTypeQuery(selectedOption)
                    }
                  />
                </span>
                <InfoIcon
                  overlay="For tumor type specific information, please select a tumor type from the dropdown"
                  placement="top"
                  style={{ fontSize: '0.6rem' }}
                />
              </div>
            </Col>
          </Row>
          {this.store.tumorTypeQuery ? (
            <Row>
              <Col>
                {this.tumorTypeSummaries.map(summary => {
                  return (
                    <div className={DEFAULT_MARGIN_BOTTOM_LG}>
                      {summary.content}
                    </div>
                  );
                })}
              </Col>
            </Row>
          ) : null}
          {this.store.therapeuticImplications.length > 0 ? (
            <Row>
              <Col>
                <OncoKBTable
                  data={this.store.therapeuticImplications}
                  columns={this.therapeuticTableColumns}
                  pageSize={
                    this.store.therapeuticImplications.length === 0
                      ? 1
                      : this.store.therapeuticImplications.length
                  }
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
      </DocumentTitle>
    );
  }
}
