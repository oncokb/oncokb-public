import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore } from 'app/store/AnnotationStore';
import { computed, IReactionDisposer, observable, reaction } from 'mobx';
import AppStore from 'app/store/AppStore';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { RouterStore } from 'mobx-react-router';
import DocumentTitle from 'react-document-title';
import { Else, If, Then } from 'react-if';
import { RouteComponentProps } from 'react-router';
import AnnotationPage from 'app/pages/annotationPage/AnnotationPage';
import * as QueryString from 'query-string';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  QUERY_SEPARATOR_FOR_QUERY_STRING,
  REFERENCE_GENOME,
} from 'app/config/constants';
import { Alert } from 'react-bootstrap';
import autobind from 'autobind-decorator';
import {
  AlterationPageHashQueries,
  AlterationPageSearchQueries,
} from 'app/shared/route/types';
import WindowStore from 'app/store/WindowStore';

interface MatchParams {
  hgvsg: string;
}

interface HgvsgPageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  routing: RouterStore;
  windowStore: WindowStore;
}

@inject('appStore', 'routing', 'windowStore')
@observer
export default class HgvsgPage extends React.Component<HgvsgPageProps> {
  @observable tumorType = '';
  @observable refGenome = REFERENCE_GENOME.GRCh37;
  private selectedTab: ANNOTATION_PAGE_TAB_KEYS;

  private store: AnnotationStore;
  readonly reactions: IReactionDisposer[] = [];

  constructor(props: any) {
    super(props);

    if (props.match.params) {
      this.store = new AnnotationStore({
        hgsvgQuery: props.match.params.hgvsg,
        tumorTypeQuery: this.tumorType,
        referenceGenomeQuery: this.refGenome,
      });
    }
    this.props.appStore.toFdaRecognizedContent = false;

    this.reactions.push(
      reaction(
        () => [props.routing.location.search],
        ([search]) => {
          const queryStrings = QueryString.parse(
            search
          ) as AlterationPageSearchQueries;
          if (queryStrings.refGenome) {
            this.refGenome = queryStrings.refGenome;
            this.store.referenceGenomeQuery = this.refGenome;
          }
          if (queryStrings.tumorType) {
            this.tumorType = queryStrings.tumorType;
            this.store.tumorTypeQuery = this.tumorType;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => [props.routing.location.hash],
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
      ),
      reaction(
        () => this.searchQueries,
        newHash => {
          const parsedSearchQueryString = QueryString.stringify(newHash, {
            arrayFormat: QUERY_SEPARATOR_FOR_QUERY_STRING,
          });
          window.location.search = `?${parsedSearchQueryString}`;
        }
      )
    );
  }

  @computed
  get searchQueries() {
    const queryString: Partial<AlterationPageSearchQueries> = {};
    if (this.refGenome) {
      queryString.refGenome = this.refGenome;
    }
    if (this.tumorType) {
      queryString.tumorType = this.tumorType;
    }
    return queryString;
  }

  componentWillUnmount() {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  @computed
  get documentTitle() {
    const content = [];
    if (this.store.annotationResultByHgvsg.result.query.hugoSymbol) {
      content.push(this.store.annotationResultByHgvsg.result.query.hugoSymbol);
    }
    if (this.store.annotationResultByHgvsg.result.query.alteration) {
      content.push(this.store.annotationResultByHgvsg.result.query.alteration);
    }
    if (this.store.tumorTypeQuery) {
      content.push(this.store.tumorTypeQuery);
    }
    return content.join(', ');
  }

  @computed
  get pageShouldBeRendered() {
    return (
      this.store.annotationResultByHgvsg.isComplete &&
      this.store.fdaAlterations.isComplete
    );
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

  render() {
    return (
      <DocumentTitle title={this.documentTitle}>
        <If condition={this.pageShouldBeRendered}>
          <Then>
            <If
              condition={
                !!this.store.annotationResultByHgvsg.result.query.hugoSymbol &&
                this.store.fdaAlterations.isComplete
              }
            >
              <Then>
                <AnnotationPage
                  hugoSymbol={
                    this.store.annotationResultByHgvsg.result.query.hugoSymbol
                  }
                  ensemblGenes={this.store.ensemblGenes.result}
                  alteration={
                    this.store.annotationResultByHgvsg.result.query.alteration
                  }
                  matchedAlteration={this.store.matchedAlteration}
                  tumorType={this.store.tumorTypeQuery}
                  refGenome={this.store.referenceGenomeQuery}
                  annotation={this.store.annotationResultByHgvsg.result}
                  fdaAlterations={this.store.fdaAlterations.result}
                  onChangeTumorType={newTumorType =>
                    (this.tumorType = newTumorType)
                  }
                  defaultSelectedTab={this.selectedTab}
                  onChangeTab={this.onChangeTab}
                />
              </Then>
              <Else>
                <Alert variant="warning" className={'text-center'}>
                  We do not have any information for this variant
                </Alert>
              </Else>
            </If>
          </Then>
          <Else>
            <If condition={this.store.annotationResultByHgvsg.isError}>
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
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
