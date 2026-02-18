import { GENETIC_TYPE } from 'app/components/geneticTypeTabs/GeneticTypeTabs';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_ANNOTATION,
  EVIDENCE_TYPES,
  TREATMENT_EVIDENCE_TYPES,
} from 'app/config/constants';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import {
  EnsemblGene,
  Tag,
  VariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import client from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import GermlineSomaticHeader from 'app/shared/header/GermlineSomaticHeader';
import MiniNavBarHeader from 'app/shared/nav/MiniNavBarHeader';
import SomaticGermlineBreadcrumbs from 'app/shared/nav/SomaticGermlineBreadcrumbs';
import { StickyMiniNavBarContextProvider } from 'app/shared/nav/StickyMiniNavBar';
import { AlterationPageHashQueries } from 'app/shared/route/types';
import GeneAdditionalInfoSection from 'app/shared/sections/GeneAdditionalInfoSection';
import { SomaticGermlineTile } from 'app/shared/tiles/SomaticGermlineTiles';
import { createHighestLevelOfEvidenceTileProps } from 'app/shared/tiles/tile-utils';
import { upperFirst } from 'app/shared/utils/LodashUtils';
import {
  getFdaImplicationsFromTags,
  getImplicationsFromTags,
} from 'app/shared/utils/Utils';
import AppStore from 'app/store/AppStore';
import { inject } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import * as QueryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Else, If, Then } from 'react-if';
import { RouteComponentProps } from 'react-router';
import SomaticGermlineAlterationView from '../annotationPage/SomaticGermlineAlterationView';
import VariantOverView from 'app/shared/sections/VariantOverview';
import styles from './SomaticGermlineAlterationPage.module.scss';
import classnames from 'classnames';

type MatchParams = {
  hugoSymbol: string;
  tag: string;
};

type SomaticGermlineTagPageProps = {
  appStore: AppStore;
  routing: RouterStore;
} & RouteComponentProps<MatchParams>;

enum LoadState {
  Loading,
  Success,
  Error,
}

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

const SomaticTagPage = inject(
  'appStore',
  'routing'
)((props: SomaticGermlineTagPageProps) => {
  const { hugoSymbol, tag: tagName } = props.match.params;
  const documentTitle = `${upperFirst(
    GENETIC_TYPE.SOMATIC
  )} ${hugoSymbol} ${tagName}`;

  const [pageLoadState, setPageLoadState] = useState<PageLoadState>({
    state: LoadState.Loading,
  });
  const [showAdditionalGeneInfo, setShowAdditionalGeneInfo] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    ANNOTATION_PAGE_TAB_KEYS | undefined
  >();

  useEffect(() => {
    async function fetchInfo() {
      try {
        const [fetchedTag, genes] = await Promise.all([
          privateClient.getTagByHugoSymbolAndNameUsingGET({
            hugoSymbol,
            name: tagName,
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
      } catch (e) {
        setPageLoadState({ state: LoadState.Error });
      }
    }

    fetchInfo();
  }, []);

  useEffect(() => {
    const queryStrings = QueryString.parse(
      props.location.hash
    ) as AlterationPageHashQueries;
    if (queryStrings.tab) {
      setSelectedTab(queryStrings.tab);
      if (queryStrings.tab === ANNOTATION_PAGE_TAB_KEYS.FDA) {
        props.appStore.inFdaRecognizedContent = true;
      }
    }
  }, [props.location.hash]);

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
          // })}
        />
      </Helmet>
      {pageLoadState.state === LoadState.Success ? (
        (() => {
          const { tag, gene, ensemblGenes, geneSummary } = pageLoadState.data;
          const highestLevelInfo: VariantAnnotation = {
            ...DEFAULT_ANNOTATION,
            highestSensitiveLevel: tag.highestLevels.highestSensitiveLevel,
            highestDiagnosticImplicationLevel:
              tag.highestLevels.highestDiagnosticLevel,
            highestPrognosticImplicationLevel:
              tag.highestLevels.highestPrognosticLevel,
            highestResistanceLevel: tag.highestLevels.highestResistanceLevel,
            highestFdaLevel: tag.highestLevels.highestFDALevel,
          };

          return (
            <StickyMiniNavBarContextProvider>
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <SomaticGermlineBreadcrumbs
                      hugoSymbol={gene.hugoSymbol}
                      alterationName={tag.name}
                      cancerTypeName={undefined}
                      alterationNameWithDiff={tag.name}
                      germline={false}
                    />
                    <GermlineSomaticHeader
                      includeEmailLink
                      annotation={{
                        gene: gene.hugoSymbol,
                        alteration: tag.name,
                        cancerType: undefined,
                      }}
                      appStore={props.appStore}
                      alteration={tag.name}
                      proteinAlteration={undefined}
                      isGermline={false}
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
                <Row className="justify-content-center">
                  <Col md={11}>
                    <SomaticGermlineTile
                      {...createHighestLevelOfEvidenceTileProps(
                        highestLevelInfo,
                        true
                      )}
                    />
                  </Col>
                </Row>
              </Container>
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <div className="d-flex align-items-center">
                      <MiniNavBarHeader id="clinical-implications">
                        <span>Clinical Implications for this Biomarker</span>
                      </MiniNavBarHeader>
                    </div>
                    <SomaticGermlineAlterationView
                      appStore={props.appStore}
                      hugoSymbol={gene.hugoSymbol}
                      alteration={tag.name}
                      alterationQuery={tag.name}
                      germline={false}
                      matchedAlteration={undefined}
                      tumorType={''}
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
                      routing={props.routing}
                      isTag
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

export default SomaticTagPage;
