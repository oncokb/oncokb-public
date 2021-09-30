import * as React from 'react';
import { Row, Col, Tab, Nav } from 'react-bootstrap';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { PAGE_ROUTE } from 'app/config/constants';
import { observable, IReactionDisposer, reaction } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import { AboutPage } from 'app/pages/AboutPage';
import NewsPage from 'app/pages/newsPage/NewsPage';
import { TeamPage } from 'app/pages/teamPage/TeamPage';

type AboutPageNavTabProps = { appStore: AppStore; routing: RouterStore };

export enum TabKey {
  ABOUT = PAGE_ROUTE.ABOUT,
  TEAM = PAGE_ROUTE.TEAM,
  FDA_RECOGNITION = PAGE_ROUTE.FDA_RECOGNITION,
  NEWS = PAGE_ROUTE.NEWS,
}

@inject('appStore', 'routing')
@observer
export class AboutPageNavTab extends React.Component<AboutPageNavTabProps> {
  readonly reactions: IReactionDisposer[] = [];

  @observable selectedTab: TabKey = TabKey.ABOUT;

  constructor(props: AboutPageNavTabProps) {
    super(props);
    reaction(
      () => this.selectedTab,
      newSelectedTab => {
        this.props.routing.history.push({
          pathname: newSelectedTab as any,
        });
      }
    ),
      reaction(
        () => [props.routing.location.pathname],
        ([pathName]) => {
          if (Object.keys(TabKey).includes(pathName)) {
            this.selectedTab = (pathName as unknown) as TabKey;
          }
        },
        { fireImmediately: true }
      );
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
          onSelect={(selectedTab: string) => {
            this.selectedTab = selectedTab as any;
          }}
        >
          <Row>
            <Col sm={2}>
              <Nav variant="pills" className="flex-column">
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
                  <Nav.Link eventKey={TabKey.NEWS}>News</Nav.Link>
                </Nav.Item>
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
                <Tab.Pane eventKey={TabKey.FDA_RECOGNITION}></Tab.Pane>
                <Tab.Pane eventKey={TabKey.NEWS}>
                  <NewsPage routing={this.props.routing} />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </>
    );
  }
}
