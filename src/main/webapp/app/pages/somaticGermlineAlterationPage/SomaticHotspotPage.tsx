import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { HOTSPOT_TYPE } from 'app/config/constants';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import {
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
import { Redirect, RouteComponentProps } from 'react-router';
import VariantOverView from 'app/shared/sections/VariantOverview';
import styles from './SomaticGermlineAlterationPage.module.scss';
import classnames from 'classnames';
import {
  getAlterationPageLink,
  getHotspotPageLink,
} from 'app/shared/utils/UrlUtils';
import { createCancerHotspotTileProps } from 'app/shared/tiles/tile-utils';
import ShowHideText from 'app/shared/texts/ShowHideText';
import MutationEffectDescription from 'app/pages/annotationPage/MutationEffectDescription';
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
  Redirecting,
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
      };
    }
  | { state: LoadState.Redirecting; link: string }
  | { state: LoadState.Error };

/**
 * Page for a hotspot that is not an alteration of its own: an in-frame indel
 * range (/gene/PIK3R1/somatic/hotspot/439-470) or a splice site
 * (/gene/PIK3R1/somatic/hotspot/X582). A single residue hotspot is described
 * on its positional alteration page (/gene/BRAF/somatic/V600), so its hotspot
 * URL redirects there.
 */

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
        if (hotspot.type === HOTSPOT_TYPE.SINGLE_RESIDUE) {
          setPageLoadState({
            state: LoadState.Redirecting,
            link: getAlterationPageLink({
              hugoSymbol: hotspot.hugoSymbol,
              alteration: hotspot.residue,
            }),
          });
          return;
        }
        if (genes.length !== 1) {
          setPageLoadState({ state: LoadState.Error });
          return;
        }

        const gene = genes[0];
        const ensemblGenes = await privateClient.utilsEnsemblGenesGetUsingGET({
          entrezGeneId: gene.entrezGeneId,
        });

        setPageLoadState({
          state: LoadState.Success,
          data: {
            annotation,
            hotspot,
            gene,
            ensemblGenes,
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
      {pageLoadState.state === LoadState.Redirecting ? (
        <Redirect to={pageLoadState.link} />
      ) : pageLoadState.state === LoadState.Success ? (
        (() => {
          const {
            annotation,
            hotspot,
            gene,
            ensemblGenes,
          } = pageLoadState.data;
          const isInFrameIndel = hotspot.type === HOTSPOT_TYPE.IN_FRAME_INDEL;
          // An in-frame indel hotspot is titled by its residue range instead
          // of the API name (486_494insdel).
          const hotspotName = isInFrameIndel
            ? `${
                hotspot.proteinStart === hotspot.proteinEnd
                  ? hotspot.proteinStart
                  : `${hotspot.proteinStart}_${hotspot.proteinEnd}`
              } In-frame Indels`
            : hotspot.name;
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
                          ...createCancerHotspotTileProps(true, hotspot),
                          // The only tile on the page, so size it to its
                          // content instead of stretching across the row.
                          containerClassName: tileStyles.hotspotTileStandalone,
                        },
                      ]}
                    />
                  </Col>
                </Row>
              </Container>
              {hotspot.curatedVariants.length > 0 && (
                <Container>
                  <Row className="justify-content-center">
                    <Col md={11}>
                      <MiniNavBarHeader id="annotated">
                        {isInFrameIndel
                          ? `Annotated ${gene.hugoSymbol} ${hotspotName}`
                          : `Annotated ${gene.hugoSymbol} ${hotspotName} Alterations`}
                      </MiniNavBarHeader>
                      <HotspotVariantsTable
                        hugoSymbol={gene.hugoSymbol}
                        variants={hotspot.curatedVariants}
                        description={hotspot.curatedVariantsDescription}
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
