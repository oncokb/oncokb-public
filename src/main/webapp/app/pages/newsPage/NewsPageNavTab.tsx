import * as React from 'react';
import { Col, Nav, Row, Tab } from 'react-bootstrap';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { PAGE_ROUTE, PAGE_TITLE } from 'app/config/constants';
import { computed, IReactionDisposer, observable, reaction } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import { YearEndSummaryPage } from 'app/pages/yearEndSummaryPage/YearEndSummaryPage';
import { LocationDescriptorObject } from 'history';
import classnames from 'classnames';
import NewsPage from 'app/pages/newsPage/NewsPage';

type NewsPageNavTabProps = { appStore: AppStore; routing: RouterStore };

export enum TabKey {
  NEWS = PAGE_ROUTE.NEWS,
  YEAR_END_SUMMARY = PAGE_ROUTE.YEAR_END_SUMMARY,
}

export const YEAR_END_SUMMARY_RANGE = ['2023', '2022'] as const;
const HASH_KEY_DIVIDER = '+';

@inject('appStore', 'routing')
@observer
export class NewsPageNavTab extends React.Component<NewsPageNavTabProps> {
  readonly reactions: IReactionDisposer[] = [];

  @observable selectedTab: string = TabKey.NEWS.toString();

  constructor(props: NewsPageNavTabProps) {
    super(props);
    reaction(
      () => this.selectedTab,
      newSelectedTab => {
        this.props.routing.history.push(
          this.getHistoryBySelectedTab(newSelectedTab)
        );
      }
    );
    reaction(
      () => [props.routing.location.pathname],
      ([pathName]) => {
        const lowerCasePathName = pathName.toLowerCase();
        if (props.routing.location.hash) {
          let tabKey;
          if (lowerCasePathName.startsWith(PAGE_ROUTE.NEWS)) {
            tabKey = TabKey.NEWS;
          } else if (
            lowerCasePathName.startsWith(PAGE_ROUTE.YEAR_END_SUMMARY)
          ) {
            tabKey = TabKey.YEAR_END_SUMMARY;
          }
          if (tabKey) {
            const hash = props.routing.location.hash.slice(1);
            this.selectedTab = this.getTabEventKey(tabKey, hash);
          }
        } else if (Object.keys(TabKey).includes(lowerCasePathName)) {
          this.selectedTab = lowerCasePathName;
        }
      },
      { fireImmediately: true }
    );
  }

  @computed
  get inYearEndSummarySection() {
    return this.selectedTab.startsWith(PAGE_ROUTE.YEAR_END_SUMMARY);
  }

  @computed
  get inNewsSection() {
    return this.selectedTab.startsWith(PAGE_ROUTE.NEWS);
  }

  getHistoryBySelectedTab(newSelectedTab: string): LocationDescriptorObject {
    if (newSelectedTab.startsWith(PAGE_ROUTE.YEAR_END_SUMMARY)) {
      const location: LocationDescriptorObject = {
        pathname: PAGE_ROUTE.YEAR_END_SUMMARY,
      };
      const year = this.parseYearEndSummaryEventKey(newSelectedTab);
      if (year !== undefined) {
        location.hash = `#${year}`;
      }
      return location;
    } else if (newSelectedTab.startsWith(PAGE_ROUTE.NEWS)) {
      const location: LocationDescriptorObject = {
        pathname: PAGE_ROUTE.NEWS,
      };
      const year = this.parseYearEndSummaryEventKey(newSelectedTab);
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

  getTabEventKey(tab: TabKey, hash: string | undefined) {
    return `${tab}${hash ? HASH_KEY_DIVIDER + hash : ''}`;
  }

  parseYearEndSummaryEventKey(eventKey: string): string | undefined {
    const components = eventKey.split(HASH_KEY_DIVIDER);
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
          id="news-page-nav-tabs"
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
                  <Nav.Link eventKey={TabKey.NEWS}>Latest News</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey={TabKey.YEAR_END_SUMMARY}>
                    {PAGE_TITLE.YEAR_END_SUMMARY}
                  </Nav.Link>
                </Nav.Item>
                {this.inYearEndSummarySection &&
                  YEAR_END_SUMMARY_RANGE.map(year => {
                    const key = this.getTabEventKey(
                      TabKey.YEAR_END_SUMMARY,
                      year
                    );
                    return (
                      <Nav.Item key={key}>
                        <Nav.Link eventKey={key} className={'ml-3'}>
                          {year}
                        </Nav.Link>
                      </Nav.Item>
                    );
                  })}
              </Nav>
            </Col>
            <Col sm={10}>
              <Tab.Content>
                <Tab.Pane eventKey={TabKey.NEWS}>
                  <NewsPage routing={this.props.routing} />
                </Tab.Pane>
                <Tab.Pane
                  eventKey={TabKey.YEAR_END_SUMMARY}
                  key={TabKey.YEAR_END_SUMMARY}
                  unmountOnExit
                >
                  <YearEndSummaryPage />
                </Tab.Pane>
                {this.inYearEndSummarySection &&
                  YEAR_END_SUMMARY_RANGE.map(year => {
                    const key = this.getTabEventKey(
                      TabKey.YEAR_END_SUMMARY,
                      year
                    );
                    return (
                      <Tab.Pane eventKey={key} key={key} unmountOnExit>
                        <YearEndSummaryPage selectedYear={year} />
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
