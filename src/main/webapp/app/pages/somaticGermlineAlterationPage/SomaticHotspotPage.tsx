import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import { CANCER_HOTSPOTS_LINK, EVIDENCE_TYPES } from 'app/config/constants';
import { Gene } from 'app/shared/api/generated/OncoKbAPI';
import {
  BiologicalVariant,
  EnsemblGene,
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
import {
  getHotspotMutationEffectDescription,
  getHotspotSummary,
} from 'app/components/cancerHotspot/HotspotText';
import ShowHideText from 'app/shared/texts/ShowHideText';
import MutationEffectDescription from 'app/pages/annotationPage/MutationEffectDescription';
import {
  getHotspot,
  getHotspotVariants,
  Hotspot,
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
        hotspot: Hotspot;
        gene: Gene;
        ensemblGenes: EnsemblGene[];
        geneSummary: string;
        hotspotVariants: BiologicalVariant[];
      };
    }
  | { state: LoadState.Error };

/**
 * Page for a cancer hotspot position, e.g. /gene/BRAF/somatic/hotspot/V600 for
 * a single residue and /gene/CDKN2A/somatic/hotspot/27-42 for an in-frame indel
 * range. It describes the position itself and lists the alterations OncoKB
 * curates on it; each of those still has its own alteration page.
 *
 * TEMPORARY: the hotspot record is read from the bundled data file. Replace
 * with the hotspot API when it is available. See
 * app/pages/genePage/hotspot/HotspotUtils.ts
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
        const hotspot = getHotspot(hugoSymbol, residue);
        if (!hotspot) {
          setPageLoadState({ state: LoadState.Error });
          return;
        }

        const genes = await client.genesLookupGetUsingGET({
          query: hugoSymbol,
        });
        if (genes.length !== 1) {
          setPageLoadState({ state: LoadState.Error });
          return;
        }

        const gene = genes[0];
        const [
          geneSummaryEvidences,
          ensemblGenes,
          biologicalVariants,
        ] = await Promise.all([
          client.evidencesLookupGetUsingGET({
            hugoSymbol: gene.hugoSymbol,
            evidenceTypes: EVIDENCE_TYPES.GENE_SUMMARY,
          }),
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
            hotspot,
            gene,
            ensemblGenes,
            geneSummary: geneSummaryEvidences[0].description,
            hotspotVariants: getHotspotVariants(hotspot, biologicalVariants),
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
            hotspot,
            gene,
            ensemblGenes,
            geneSummary,
            hotspotVariants,
          } = pageLoadState.data;
          const hotspotTypeLabel =
            HOTSPOT_TYPE_LABEL[hotspot.type] ?? hotspot.type;
          return (
            <StickyMiniNavBarContextProvider>
              <Container>
                <Row className="justify-content-center">
                  <Col md={11}>
                    <SomaticGermlineBreadcrumbs
                      hugoSymbol={gene.hugoSymbol}
                      alterationName={hotspot.residue}
                      cancerTypeName={undefined}
                      alterationNameWithDiff={hotspot.residue}
                      germline={false}
                    />
                    <GermlineSomaticHeader
                      includeEmailLink
                      annotation={{
                        gene: gene.hugoSymbol,
                        alteration: hotspot.residue,
                        cancerType: undefined,
                      }}
                      appStore={props.appStore}
                      alteration={hotspot.residue}
                      proteinAlteration={undefined}
                      isGermline={false}
                      extra={
                        <span
                          className={'text-muted ml-2'}
                          style={{ fontSize: '0.5em' }}
                        >
                          {`(${hotspotTypeLabel} hotspot)`}
                        </span>
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
                            {
                              content: getHotspotSummary(
                                gene.hugoSymbol,
                                hotspot.residue,
                                hotspot.type
                              ),
                            },
                          ]}
                          hugoSymbol={gene.hugoSymbol}
                          alteration={hotspot.residue}
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
                          description={getHotspotMutationEffectDescription(
                            gene.hugoSymbol,
                            hotspot.residue,
                            hotspot.type
                          )}
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
                    {/* Rendered through the tile row so it keeps the same
                        spacing from the description as the tiles on the
                        alteration page. */}
                    <SomaticGermlineTiles
                      tiles={[
                        {
                          title: 'Cancer Hotspot',
                          className: tileStyles.hotspotTile,
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
                        {`Annotated ${gene.hugoSymbol} ${hotspot.residue} Alterations`}
                      </MiniNavBarHeader>
                      <HotspotVariantsTable
                        hugoSymbol={gene.hugoSymbol}
                        variants={hotspotVariants}
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
