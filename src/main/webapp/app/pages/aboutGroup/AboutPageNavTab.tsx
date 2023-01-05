import * as React from 'react';
import { Row, Col, Tab, Nav } from 'react-bootstrap';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { ONCOKB_TM, PAGE_ROUTE, PAGE_TITLE } from 'app/config/constants';
import { observable, IReactionDisposer, reaction, computed } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import { AboutPage } from 'app/pages/AboutPage';
import { TeamPage } from 'app/pages/teamPage/TeamPage';
import Iframe from 'react-iframe';
import FdaRecognitionPage from 'app/pages/aboutGroup/FdaRecognitionPage';
import { YearEndReviewPage } from 'app/pages/yearEndReviewPage/YearEndReviewPage';
import { LocationDescriptorObject } from 'history';
import classnames from 'classnames';

type AboutPageNavTabProps = { appStore: AppStore; routing: RouterStore };

export enum TabKey {
  ABOUT = PAGE_ROUTE.ABOUT,
  TEAM = PAGE_ROUTE.TEAM,
  FDA_RECOGNITION = PAGE_ROUTE.FDA_RECOGNITION,
  SOP = PAGE_ROUTE.SOP,
  YEAR_END_REVIEW = PAGE_ROUTE.YEAR_END_REVIEW,
}

export const YEAR_END_REVIEW_RANGE = ['2022'] as const;
const YEAR_END_REVIEW_KEY_DIVIDER = '+';

@inject('appStore', 'routing')
@observer
export class AboutPageNavTab extends React.Component<AboutPageNavTabProps> {
  readonly reactions: IReactionDisposer[] = [];

  @observable selectedTab: string = TabKey.ABOUT.toString();

  constructor(props: AboutPageNavTabProps) {
    super(props);
    reaction(
      () => this.selectedTab,
      newSelectedTab => {
        this.props.routing.history.push(
          this.getHistoryBySelectedTab(newSelectedTab)
        );
      }
    ),
      reaction(
        () => [props.routing.location.pathname],
        ([pathName]) => {
          if (
            pathName.startsWith(PAGE_ROUTE.YEAR_END_REVIEW) &&
            props.routing.location.hash
          ) {
            const year = props.routing.location.hash.slice(1);
            this.selectedTab = this.getYearEndReviewEventKey(year);
          } else if (Object.keys(TabKey).includes(pathName)) {
            this.selectedTab = pathName;
          }
        },
        { fireImmediately: true }
      );
  }

  @computed
  get inYearEndReviewSection() {
    return this.selectedTab.startsWith(PAGE_ROUTE.YEAR_END_REVIEW);
  }

  getHistoryBySelectedTab(newSelectedTab: string): LocationDescriptorObject {
    if (newSelectedTab.startsWith(PAGE_ROUTE.YEAR_END_REVIEW)) {
      const location: LocationDescriptorObject = {
        pathname: PAGE_ROUTE.YEAR_END_REVIEW,
      };
      const year = this.parseYearEndReviewEventKey(newSelectedTab);
      if (year !== undefined) {
        location.hash = `#${year}`;
      }
      return location;
    } else {
      return {
        pathname: newSelectedTab,
      };
    }
  }

  getYearEndReviewEventKey(year: string | undefined) {
    return `${TabKey.YEAR_END_REVIEW}${
      year ? YEAR_END_REVIEW_KEY_DIVIDER + year : ''
    }`;
  }

  parseYearEndReviewEventKey(eventKey: string): string | undefined {
    const components = eventKey.split(YEAR_END_REVIEW_KEY_DIVIDER);
    if (components.length <= 1) {
      return undefined;
    } else {
      return components[1];
    }
  }

  componentWillUnmount() {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  render() {
    return (
      <>
        <Tab.Container
          id="about-page-nav-tabs"
          activeKey={this.selectedTab}
          unmountOnExit
          onSelect={(selectedTab: string) => {
            this.selectedTab = selectedTab as any;
          }}
        >
          <Row>
            <Col sm={2}>
              <Nav
                variant="pills"
                className={classnames(
                  'flex-column',
                  'sticky-top',
                  'sticky-panel-relevant-to-header'
                )}
              >
                <Nav.Item>
                  <Nav.Link eventKey={TabKey.ABOUT}>About</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey={TabKey.TEAM}>Team</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey={TabKey.FDA_RECOGNITION}>
                    FDA Recognition
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey={TabKey.SOP}>{PAGE_TITLE.SOP}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey={TabKey.YEAR_END_REVIEW}>
                    {PAGE_TITLE.YEAR_END_REVIEW}
                  </Nav.Link>
                </Nav.Item>
                {this.inYearEndReviewSection &&
                  YEAR_END_REVIEW_RANGE.map(year => {
                    const key = this.getYearEndReviewEventKey(year);
                    return (
                      <Nav.Item key={key}>
                        <Nav.Link eventKey={key}>{year}</Nav.Link>
                      </Nav.Item>
                    );
                  })}
              </Nav>
            </Col>
            <Col sm={10}>
              <Tab.Content>
                <Tab.Pane eventKey={TabKey.ABOUT}>
                  <AboutPage
                    appStore={this.props.appStore}
                    routing={this.props.routing}
                  />
                </Tab.Pane>
                <Tab.Pane eventKey={TabKey.TEAM}>
                  <TeamPage />
                </Tab.Pane>
                <Tab.Pane eventKey={TabKey.FDA_RECOGNITION}>
                  <FdaRecognitionPage />
                </Tab.Pane>
                <Tab.Pane eventKey={TabKey.SOP}>
                  <div>
                    <div style={{ marginTop: '-5px' }}>
                      <Iframe
                        width="100%"
                        height="1000px"
                        url="https://sop.oncokb.org"
                        frameBorder={0}
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <h2 style={{ position: 'absolute', top: 0 }}>
                      {ONCOKB_TM} Standard Operating Procedure
                    </h2>
                  </div>
                </Tab.Pane>
                <Tab.Pane
                  eventKey={TabKey.YEAR_END_REVIEW}
                  key={TabKey.YEAR_END_REVIEW}
                  unmountOnExit
                >
                  <YearEndReviewPage />
                </Tab.Pane>
                {this.inYearEndReviewSection &&
                  YEAR_END_REVIEW_RANGE.map(year => {
                    const key = this.getYearEndReviewEventKey(year);
                    return (
                      <Tab.Pane eventKey={key} key={key} unmountOnExit>
                        <YearEndReviewPage selectedYear={year} />
                      </Tab.Pane>
                    );
                  })}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </>
    );
  }
}
