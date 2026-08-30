import React from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { RouteComponentProps } from 'react-router';
import { GenePageLink } from 'app/shared/utils/UrlUtils';

type MatchParams = {
  hugoSymbol: string;
};

/**
 * TEMPORARY — REMOVE WHEN THE HOTSPOT RANGE PAGES EXIST.
 *
 * An alteration on an in-frame indel hotspot range has nowhere to link to yet:
 * the annotation only says the alteration is on a hotspot, not which range, and
 * a range has no OncoKB alteration name of its own. Until both are resolved,
 * the hotspot icon of those alterations lands here.
 */
const SomaticHotspotRangePage = (props: RouteComponentProps<MatchParams>) => {
  const { hugoSymbol } = props.match.params;
  return (
    <div className="view-wrapper">
      <Helmet>
        <title>{`${hugoSymbol} hotspot range`}</title>
      </Helmet>
      <Container>
        <Row className="justify-content-center">
          <Col md={11}>
            <Alert variant="info" className="text-center my-5">
              <h4>Hotspot range page placeholder</h4>
              <p className="mb-0">
                This alteration falls on an in-frame indel hotspot range in{' '}
                <GenePageLink hugoSymbol={hugoSymbol} germline={false} />. The
                page describing the range is under construction.
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SomaticHotspotRangePage;
