import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { CANCER_HOTSPOTS_LINK } from 'app/config/constants';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import {
  BiologicalVariant,
  CancerHotspot,
  EnsemblGene,
  SomaticVariantAnnotation,
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import client from 'app/shared/api/oncokbClientInstance';
import privateClient from 'app/shared/api/oncokbPrivateClientInstance';
import GermlineSomaticHeader from 'app/shared/header/GermlineSomaticHeader';
import SomaticGermlineBreadcrumbs from 'app/shared/nav/SomaticGermlineBreadcrumbs';
import { StickyMiniNavBarContextProvider } from 'app/shared/nav/StickyMiniNavBar';
import MiniNavBarHeader from 'app/shared/nav/MiniNavBarHeader';
import GeneAdditionalInfoSection from 'app/shared/sections/GeneAdditionalInfoSection';
import SomaticGermlineTiles from 'app/shared/tiles/SomaticGermlineTiles';
import tileStyles from 'app/shared/tiles/SomaticGermlineTiles.module.scss';
import AppStore from 'app/store/AppStore';
import { inject } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React, { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { Else, If, Then } from 'react-if';
import { RouteComponentProps } from 'react-router';
import VariantOverView from 'app/shared/sections/VariantOverview';
import styles from './SomaticGermlineAlterationPage.module.scss';
import classnames from 'classnames';
import { getHotspotPageLink } from 'app/shared/utils/UrlUtils';
import { Linkout } from 'app/shared/links/Linkout';
import { CancerHotspotIcon } from 'app/components/cancerHotspot/CancerHotspot';
import ShowHideText from 'app/shared/texts/ShowHideText';
import MutationEffectDescription from 'app/pages/annotationPage/MutationEffectDescription';
import {
  getHotspotCuratedAlterationsDescription,
  getHotspotVariants,
  HOTSPOT_TYPE,
  HOTSPOT_TYPE_LABEL,
} from 'app/pages/genePage/hotspot/HotspotUtils';
import HotspotVariantsTable from 'app/pages/genePage/hotspot/HotspotVariantsTable';

type MatchParams = {
  hugoSymbol: string;
  residue: string;
};

type SomaticHotspotPageProps = {
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
        annotation: SomaticVariantAnnotation;
        hotspot: CancerHotspot;
        gene: Gene;
        ensemblGenes: EnsemblGene[];
        hotspotVariants: BiologicalVariant[];
      };
    }
  | { state: LoadState.Error };

const SomaticHotspotPage = inject(
  'appStore',
  'routing'
)((props: SomaticHotspotPageProps) => {
  const { hugoSymbol, residue } = props.match.params;
  const documentTitle = `${hugoSymbol} ${residue}`;

  const [pageLoadState, setPageLoadState] = useState<PageLoadState>({
    state: LoadState.Loading,
  });
  const [showAdditionalGeneInfo, setShowAdditionalGeneInfo] = useState(false);
  const [showMutationEffect, setShowMutationEffect] = useState(true);

  useEffect(() => {
    async function fetchInfo() {
      try {
        const [annotation, genes] = await Promise.all([
          privateClient.utilHotspotAnnotationGetUsingGET({
            hugoSymbol,
            residue,
          }),
          client.genesLookupGetUsingGET({
            query: hugoSymbol,
          }),
        ]);
        const hotspot = annotation.cancerHotspot;
        if (!hotspot) {
          setPageLoadState({ state: LoadState.Error });
          return;
        }
        if (genes.length !== 1) {
          setPageLoadState({ state: LoadState.Error });
          return;
        }

        const gene = genes[0];
        const [ensemblGenes, biologicalVariants] = await Promise.all([
          privateClient.utilsEnsemblGenesGetUsingGET({
            entrezGeneId: gene.entrezGeneId,
          }),
          privateClient.searchVariantsBiologicalGetUsingGET({
            hugoSymbol: gene.hugoSymbol,
            germline: false,
          }),
        ]);

        setPageLoadState({
          state: LoadState.Success,
          data: {
            annotation,
            hotspot,
            gene,
            ensemblGenes,
            hotspotVariants: getHotspotVariants(
              hotspot.curatedAlterations,
              biologicalVariants
            ),
          },
        });
      } catch (e) {
        setPageLoadState({ state: LoadState.Error });
      }
    }

    fetchInfo();
  }, [hugoSymbol, residue]);

  return (
    <div className="view-wrapper">
      <Helmet>
        <title>{documentTitle}</title>
        <link
          id="canonical"
          rel="canonical"
          href={getHotspotPageLink({
            hugoSymbol,
            residue,
            withProtocolHostPrefix: true,
          })}
        />
      </Helmet>
      {pageLoadState.state === LoadState.Success ? (
        (() => {
          const {
            annotation,
            hotspot,
            gene,
            ensemblGenes,
            hotspotVariants,
          } = pageLoadState.data;
          const hotspotTypeLabel =
            HOTSPOT_TYPE_LABEL[hotspot.type] ?? hotspot.type;
          const hotspotName = hotspot.name;
          return (
            <StickyMiniNavBarContextProvider>
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <SomaticGermlineBreadcrumbs
                      hugoSymbol={gene.hugoSymbol}
                      alterationName={hotspotName}
                      cancerTypeName={undefined}
                      alterationNameWithDiff={hotspotName}
                      germline={false}
                    />
                    <GermlineSomaticHeader
                      includeEmailLink
                      annotation={{
                        gene: gene.hugoSymbol,
                        alteration: hotspotName,
                        cancerType: undefined,
                      }}
                      appStore={props.appStore}
                      alteration={hotspotName}
                      proteinAlteration={undefined}
                      isGermline={false}
                      extra={
                        hotspot.type !== HOTSPOT_TYPE.SINGLE_RESIDUE && (
                          <span
                            className={'text-muted ml-2'}
                            style={{ fontSize: '0.5em' }}
                          >
                            {`(${hotspotTypeLabel} hotspot)`}
                          </span>
                        )
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
                            { content: annotation.geneSummary },
                            { content: annotation.variantSummary },
                          ]}
                          hugoSymbol={gene.hugoSymbol}
                          alteration={hotspotName}
                          geneType={gene.geneType}
                          isOverviewOnly
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Container>
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <ShowHideText
                      show={showMutationEffect}
                      title="mutation effect description"
                      content={
                        <MutationEffectDescription
                          hugoSymbol={gene.hugoSymbol}
                          description={annotation.mutationEffect.description}
                        />
                      }
                      onClick={() => setShowMutationEffect(show => !show)}
                    />
                  </Col>
                </Row>
              </Container>
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <SomaticGermlineTiles
                      tiles={[
                        {
                          title: 'Cancer Hotspot',
                          className: tileStyles.hotspotTile,
                          containerClassName: tileStyles.hotspotTileShrink,
                          items: [
                            [
                              {
                                title: (
                                  <Linkout link={CANCER_HOTSPOTS_LINK}>
                                    cancerhotspots.org
                                  </Linkout>
                                ),
                                value: (
                                  <span className="h5">
                                    <CancerHotspotIcon />
                                  </span>
                                ),
                              },
                              {
                                title: 'Type',
                                value: hotspotTypeLabel,
                              },
                              {
                                title: 'Tumor Samples',
                                value: `${hotspot.tumorCount}`,
                              },
                            ],
                          ],
                        },
                      ]}
                    />
                  </Col>
                </Row>
              </Container>
              {hotspotVariants.length > 0 && (
                <Container>
                  <Row className="justify-content-center">
                    <Col md={11}>
                      <MiniNavBarHeader id="annotated">
                        {`Annotated ${gene.hugoSymbol} ${hotspotName} Alterations`}
                      </MiniNavBarHeader>
                      <HotspotVariantsTable
                        hugoSymbol={gene.hugoSymbol}
                        variants={hotspotVariants}
                        description={getHotspotCuratedAlterationsDescription(
                          gene.hugoSymbol,
                          hotspot
                        )}
                      />
                    </Col>
                  </Row>
                </Container>
              )}
            </StickyMiniNavBarContextProvider>
          );
        })()
      ) : (
        <If condition={pageLoadState.state === LoadState.Error}>
          <Then>
            <Alert variant="warning" className={'text-center'}>
              We do not have any information for this hotspot
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

export default SomaticHotspotPage;
