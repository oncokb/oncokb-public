import { GENETIC_TYPE } from 'app/components/geneticTypeTabs/GeneticTypeTabs';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import GeneticTypeTag from 'app/components/tag/GeneticTypeTag';
import { COLOR_BLUE } from 'app/config/theme';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import { EnsemblGene, Tag } from 'app/shared/api/generated/OncoKbPrivateAPI';
import client from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import SomaticGermlineCancerTypeSelect from 'app/shared/dropdown/SomaticGermlineCancerTypeSelect';
import GermlineSomaticHeader from 'app/shared/header/GermlineSomaticHeader';
import SomaticGermlineBreadcrumbs from 'app/shared/nav/SomaticGermlineBreadcrumbs';
import StickyMiniNavBar, {
  StickyMiniNavBarContextProvider,
} from 'app/shared/nav/StickyMiniNavBar';
import GeneAdditionalInfoSection from 'app/shared/sections/GeneAdditionalInfoSection';
import { upperFirst } from 'app/shared/utils/LodashUtils';
import React, { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Else, If, Then } from 'react-if';
import { RouteComponentProps } from 'react-router';
import { CancerTypeView } from './CancerTypeView';
import { inject } from 'mobx-react';
import AppStore from 'app/store/AppStore';
import { RouterStore } from 'mobx-react-router';
import classnames from 'classnames';
import WindowStore from 'app/store/WindowStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_ANNOTATION,
  EVIDENCE_TYPES,
  TREATMENT_EVIDENCE_TYPES,
} from 'app/config/constants';
import {
  getFdaImplicationsFromTags,
  getImplicationsFromTags,
} from 'app/shared/utils/Utils';
import { AlterationPageHashQueries } from 'app/shared/route/types';
import * as QueryString from 'query-string';
import VariantOverView from 'app/shared/sections/VariantOverview';
import styles from './SomaticGermlineCancerTypePage.module.scss';

enum LoadState {
  Loading,
  Success,
  Error,
}

type MatchParams = {
  hugoSymbol: string;
  tag: string;
  tumorType: string;
};

type SomaticTagCancerTypePageProps = {
  appStore: AppStore;
  routing: RouterStore;
  windowStore: WindowStore;
  authenticationStore: AuthenticationStore;
} & RouteComponentProps<MatchParams>;

type PageLoadState =
  | { state: LoadState.Loading }
  | {
      state: LoadState.Success;
      data: {
        tag: Tag;
        gene: Gene;
        ensemblGenes: EnsemblGene[];
        geneSummary: string;
      };
    }
  | { state: LoadState.Error };

const SomaticTagCancerTypePage = inject(
  'appStore',
  'routing',
  'windowStore',
  'authenticationStore'
)((props: SomaticTagCancerTypePageProps) => {
  const { hugoSymbol, tag: tagName, tumorType } = props.match.params;
  const documentTitle = `${upperFirst(
    GENETIC_TYPE.SOMATIC
  )} ${hugoSymbol} ${tagName}`;

  const [showAdditionalGeneInfo, setShowAdditionalGeneInfo] = useState(false);
  const [pageLoadState, setPageLoadState] = useState<PageLoadState>({
    state: LoadState.Loading,
  });
  const [selectedTab, setSelectedTab] = useState<
    ANNOTATION_PAGE_TAB_KEYS | undefined
  >();

  useEffect(() => {
    async function fetchInfo() {
      setPageLoadState({ state: LoadState.Loading });
      try {
        const [fetchedTag, genes] = await Promise.all([
          privateClient.getTagByHugoSymbolAndNameAndTumorTypeUsingGET({
            hugoSymbol,
            name: tagName,
            tumorType,
          }),
          client.genesLookupGetUsingGET({ query: hugoSymbol }),
        ]);

        if (genes.length !== 1) {
          setPageLoadState({ state: LoadState.Error });
          return;
        }

        const gene = genes[0];
        const [geneSummaryEvidences, ensemblGenes] = await Promise.all([
          client.evidencesLookupGetUsingGET({
            hugoSymbol: gene.hugoSymbol,
            evidenceTypes: EVIDENCE_TYPES.GENE_SUMMARY,
          }),
          privateClient.utilsEnsemblGenesGetUsingGET({
            entrezGeneId: gene.entrezGeneId,
          }),
        ]);

        setPageLoadState({
          state: LoadState.Success,
          data: {
            tag: fetchedTag,
            gene,
            ensemblGenes,
            geneSummary: geneSummaryEvidences[0].description,
          },
        });
      } catch {
        setPageLoadState({ state: LoadState.Error });
      }
    }

    fetchInfo();
  }, [tumorType]);

  function onChangeTab(
    selectedTabKey: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) {
    if (newTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA) {
      props.appStore.inFdaRecognizedContent = true;
    }
    if (
      selectedTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA &&
      newTabKey !== ANNOTATION_PAGE_TAB_KEYS.FDA
    ) {
      props.appStore.showFdaModal = true;
    } else {
      const newHash: AlterationPageHashQueries = { tab: newTabKey };
      window.location.hash = QueryString.stringify(newHash);
    }
    setSelectedTab(newTabKey);
  }

  return (
    <div className="view-wrapper">
      <Helmet>
        <title>{documentTitle}</title>
        <link
          id="canonical"
          rel="canonical"
          // href={getAlterationPageLink({
          //   hugoSymbol: this.store.hugoSymbol,
          //   alteration: this.store.alterationQuery,
          //   cancerType: this.store.cancerTypeName,
          //   withProtocolHostPrefix: true,
          //   germline: this.store.germline,
          // })}
        />
      </Helmet>
      {pageLoadState.state === LoadState.Success ? (
        (() => {
          const { tag, gene, ensemblGenes, geneSummary } = pageLoadState.data;
          return (
            <StickyMiniNavBarContextProvider>
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <SomaticGermlineBreadcrumbs
                      hugoSymbol={gene.hugoSymbol}
                      alterationName={tag.name}
                      cancerTypeName={tumorType}
                      alterationNameWithDiff={tag.name}
                      germline={false}
                      isTag
                    />
                    <GermlineSomaticHeader
                      includeEmailLink
                      annotation={{
                        gene: gene.hugoSymbol,
                        alteration: tag.name,
                        cancerType: tumorType,
                      }}
                      appStore={props.appStore}
                      alteration={tag.name}
                      proteinAlteration={undefined}
                      isGermline={false}
                      extra={
                        <SomaticGermlineCancerTypeSelect
                          pretext="in"
                          cancerType={tumorType}
                          isClearable={false}
                          routing={props.routing}
                          hugoSymbol={gene.hugoSymbol}
                          alterationQuery={tag.name}
                          germline={false}
                          onchange={() => {}}
                          isTag
                          selectStyles={{
                            singleValue(base) {
                              return {
                                ...base,
                                color: COLOR_BLUE,
                              };
                            },
                            input(base) {
                              return {
                                ...base,
                                color: COLOR_BLUE,
                              };
                            },
                            menu(base) {
                              return {
                                ...base,
                                fontSize: '1rem',
                                fontFamily: '"Gotham Book", serif',
                              };
                            },
                          }}
                        />
                      }
                    />
                    <GeneAdditionalInfoSection
                      gene={gene}
                      ensemblGenes={ensemblGenes}
                      show={showAdditionalGeneInfo}
                      onToggle={() => setShowAdditionalGeneInfo(show => !show)}
                    />
                  </Col>
                  <Col md={11} style={{ marginBottom: 8 }}>
                    <Row className={classnames(styles.descriptionContainer)}>
                      <Col>
                        <VariantOverView
                          alterationSummaries={[
                            { content: geneSummary },
                            { content: tag.description },
                          ]}
                          hugoSymbol={gene.hugoSymbol}
                          alteration={tag.name}
                          geneType={gene.geneType}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Container>
              <Container>
                <Row className={classnames('justify-content-center', 'mt-5')}>
                  <Col md={11}>
                    <h3>
                      Clinical Implications of This Biomarker in {tumorType}
                      {/* {cancerTypeCode && ` (${cancerTypeCode})`} */}
                    </h3>
                  </Col>
                </Row>
              </Container>
              <StickyMiniNavBar
                title={
                  <span className={'d-flex align-items-center'}>
                    <span>
                      {gene.hugoSymbol} {tag.name}{' '}
                    </span>
                    <GeneticTypeTag className={'ml-2'} isGermline={false} />
                  </span>
                }
              />
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <CancerTypeView
                      isGermline={false}
                      appStore={props.appStore}
                      isLargeScreen={props.windowStore.isLargeScreen}
                      userAuthenticated={
                        props.authenticationStore.isUserAuthenticated
                      }
                      hugoSymbol={gene.hugoSymbol}
                      alteration={tag.name}
                      matchedAlteration={undefined}
                      tumorType={tumorType}
                      onChangeTumorType={() => {}}
                      annotation={DEFAULT_ANNOTATION}
                      biologicalAlterations={[]}
                      relevantAlterations={undefined}
                      fdaImplication={getFdaImplicationsFromTags(
                        [tag],
                        hugoSymbol
                      )}
                      therapeuticImplications={getImplicationsFromTags(
                        [tag],
                        TREATMENT_EVIDENCE_TYPES,
                        gene.hugoSymbol
                      )}
                      diagnosticImplications={getImplicationsFromTags(
                        [tag],
                        [EVIDENCE_TYPES.DIAGNOSTIC_IMPLICATION],
                        gene.hugoSymbol
                      )}
                      prognosticImplications={getImplicationsFromTags(
                        [tag],
                        [EVIDENCE_TYPES.PROGNOSTIC_IMPLICATION],
                        gene.hugoSymbol
                      )}
                      defaultSelectedTab={selectedTab}
                      onChangeTab={onChangeTab}
                    />
                  </Col>
                </Row>
              </Container>
            </StickyMiniNavBarContextProvider>
          );
        })()
      ) : (
        <If condition={pageLoadState.state === LoadState.Error}>
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
      )}
    </div>
  );
});

export default SomaticTagCancerTypePage;
