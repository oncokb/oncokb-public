import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnnotationStore } from 'app/store/AnnotationStore';
import { computed, action, IReactionDisposer, reaction } from 'mobx';
import AppStore from 'app/store/AppStore';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { ANNOTATION_PAGE_TAB_KEYS, DEFAULT_GENE } from 'app/config/constants';
import { decodeSlash, encodeSlash } from 'app/shared/utils/Utils';
import { RouterStore } from 'mobx-react-router';
import DocumentTitle from 'react-document-title';
import { Else, If, Then } from 'react-if';
import { UnknownGeneAlert } from 'app/shared/alert/UnknownGeneAlert';
import { RouteComponentProps } from 'react-router';
import AnnotationPage from 'app/pages/annotationPage/AnnotationPage';
import * as QueryString from 'query-string';
import {
  AlterationPageHashQueries,
  AlterationPageSearchQueries,
} from 'app/shared/route/types';
import autobind from 'autobind-decorator';

interface MatchParams {
  hugoSymbol: string;
  alteration: string;
  tumorType?: string;
}

interface AlterationPageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  routing: RouterStore;
}

@inject('appStore', 'routing', 'windowStore')
@observer
export default class AlterationPage extends React.Component<
  AlterationPageProps,
  {}
> {
  private store: AnnotationStore;

  readonly reactions: IReactionDisposer[] = [];

  private selectedTab: ANNOTATION_PAGE_TAB_KEYS;

  constructor(props: any) {
    super(props);
    if (props.match.params) {
      this.store = new AnnotationStore({
        hugoSymbolQuery: props.match.params.hugoSymbol,
        alterationQuery: decodeSlash(props.match.params.alteration),
        tumorTypeQuery: props.match.params.tumorType
          ? decodeSlash(props.match.params.tumorType)
          : props.match.params.tumorType,
      });
    }
    this.props.appStore.toFdaRecognizedContent = false;

    this.reactions.push(
      reaction(
        () => this.store.tumorTypeQuery,
        newTumorType => {
          let tumorTypeSection = encodeSlash(this.store.tumorTypeQuery);
          tumorTypeSection = tumorTypeSection ? `/${tumorTypeSection}` : '';
          this.props.routing.history.push({
            pathname: `/gene/${this.store.hugoSymbolQuery}/${this.store.alterationQuery}${tumorTypeSection}`,
            search: this.props.routing.location.search,
          });
        }
      ),
      reaction(
        () => [props.routing.location.search],
        ([search]) => {
          const queryStrings = QueryString.parse(
            search
          ) as AlterationPageSearchQueries;
          if (queryStrings.refGenome) {
            this.store.referenceGenomeQuery = queryStrings.refGenome;
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
      )
    );
  }

  @action
  updateQuery(prevProps: AlterationPageProps) {
    if (
      this.props.match.params.hugoSymbol !== prevProps.match.params.hugoSymbol
    ) {
      this.store.hugoSymbolQuery = this.props.match.params.hugoSymbol;
    }
    if (
      this.props.match.params.alteration !== prevProps.match.params.alteration
    ) {
      this.store.alterationQuery = this.props.match.params.alteration;
    }
    // When a cancer type changed from the URL, we need to propagate that to the store
    // but if the cancer type is unset, we need to clear the query in the store
    if (
      this.props.match.params.tumorType !== prevProps.match.params.tumorType
    ) {
      this.store.tumorTypeQuery = this.props.match.params.tumorType
        ? decodeSlash(this.props.match.params.tumorType)!
        : '';
    }
  }

  componentDidUpdate(prevProps: AlterationPageProps) {
    this.updateQuery(prevProps);
  }

  @computed
  get pageShouldBeRendered() {
    return (
      this.store.gene.isComplete &&
      this.store.geneNumber.isComplete &&
      this.store.ensemblGenes.isComplete &&
      this.store.clinicalAlterations.isComplete &&
      this.store.biologicalAlterations.isComplete &&
      this.store.annotationResult.isComplete &&
      this.store.fdaAlterations.isComplete
    );
  }

  @computed
  get documentTitle() {
    const content = [];
    if (this.store.hugoSymbol) {
      content.push(this.store.hugoSymbol);
    }
    if (this.store.alterationQuery) {
      content.push(this.store.alterationQuery);
    }
    if (this.store.tumorTypeQuery) {
      content.push(this.store.tumorTypeQuery);
    }
    return content.join(', ');
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
            {this.store.gene.isError ||
            this.store.gene.result === DEFAULT_GENE ? (
              <UnknownGeneAlert />
            ) : (
              this.pageShouldBeRendered && (
                <AnnotationPage
                  appStore={this.props.appStore}
                  hugoSymbol={this.store.hugoSymbol}
                  ensemblGenes={this.store.ensemblGenes.result}
                  alteration={this.store.alterationQuery}
                  matchedAlteration={this.store.matchedAlteration}
                  tumorType={this.store.tumorTypeQuery}
                  refGenome={this.store.referenceGenomeQuery}
                  annotation={this.store.annotationResult.result}
                  fdaAlterations={this.store.fdaAlterations.result}
                  onChangeTumorType={newTumorType =>
                    (this.store.tumorTypeQuery = newTumorType)
                  }
                  defaultSelectedTab={this.selectedTab}
                  onChangeTab={this.onChangeTab}
                />
              )
            )}
          </Then>
          <Else>
            <LoadingIndicator
              size={LoaderSize.LARGE}
              center={true}
              isLoading={true}
            />
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
