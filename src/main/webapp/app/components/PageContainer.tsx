import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import { RouterStore } from 'mobx-react-router';
import { PAGE_ROUTE } from 'app/config/constants';
import { GENETIC_TYPE } from 'app/components/geneticTypeTabs/GeneticTypeTabs';
import { parseGenePagePath } from 'app/shared/utils/UrlUtils';

const Container: FunctionComponent<{
  inGenePage: boolean;
}> = props => {
  if (props.inGenePage) {
    return <div>{props.children}</div>;
  } else {
    return (
      <Row className={`justify-content-center`}>
        <Col md={11}>{props.children}</Col>
      </Row>
    );
  }
};
const PageContainer: React.FunctionComponent<{
  routing: RouterStore;
  windowStore: WindowStore;
}> = props => {
  const genePagePath = parseGenePagePath(props.routing.location.pathname);
  const inGenePage = genePagePath.geneticType !== undefined;
  return (
    <div className={'view-wrapper'}>
      <div
        className={
          inGenePage
            ? ''
            : props.windowStore.isXLscreen
            ? 'container'
            : 'container-fluid'
        }
      >
        <Container inGenePage={inGenePage}>{props.children}</Container>
      </div>
    </div>
  );
};
export default PageContainer;
