import * as React from 'react';
import { Row, Col, Tab, Nav } from 'react-bootstrap';
import { inject, observer } from 'mobx-react';
import { PAGE_ROUTE, PAGE_TITLE } from 'app/config/constants';
import { observable, IReactionDisposer, reaction } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import WindowStore from 'app/store/WindowStore';
import { TermsPage } from 'app/pages/apiAccessGroup/TermsPage';
import { RegisterPage } from 'app/pages/RegisterPage';
import ReadOnlyMode from 'app/shared/readonly/ReadOnlyMode';

type LicensePageNavTabProps = {
  routing: RouterStore;
  windowStore: WindowStore;
};

enum TabKey {
  TERMS = PAGE_ROUTE.TERMS,
  REGISTER = PAGE_ROUTE.REGISTER,
}

const TAB_TITLES: { [key in TabKey]: string } = {
  [TabKey.TERMS]: PAGE_TITLE.TERMS,
  [TabKey.REGISTER]: 'Apply for a license',
};

const ReadOnlyRegisterPage = ReadOnlyMode(RegisterPage);

@inject('routing', 'windowStore')
@observer
export class LicensePageNavTab extends React.Component<LicensePageNavTabProps> {
  readonly reactions: IReactionDisposer[] = [];
  private tabKeys = [TabKey.TERMS, TabKey.REGISTER];

  @observable selectedTab: TabKey = TabKey.TERMS;

  constructor(props: LicensePageNavTabProps) {
    super(props);
    this.reactions.push(
      reaction(
        () => this.selectedTab,
        newSelectedTab => {
          if (
            this.props.routing.location.pathname !== (newSelectedTab as any)
          ) {
            this.props.routing.history.push({
              pathname: newSelectedTab as any,
              hash: this.props.routing.location.hash,
            });
          }
        }
      ),
      reaction(
        () => [props.routing.location.pathname],
        ([pathName]) => {
          if (Object.values(TabKey).includes((pathName as unknown) as TabKey)) {
            this.selectedTab = (pathName as unknown) as TabKey;
          }
        },
        { fireImmediately: true }
      )
    );
  }

  componentWillUnmount() {
    this.reactions.forEach(componentReaction => componentReaction());
  }

  getTabPane(tabKey: TabKey) {
    switch (tabKey) {
      case TabKey.TERMS:
        return <TermsPage />;
      case TabKey.REGISTER:
        return (
          <ReadOnlyRegisterPage
            routing={this.props.routing}
            windowStore={this.props.windowStore}
          />
        );
      default:
        return <></>;
    }
  }

  render() {
    return (
      <Tab.Container
        id="license-page-nav-tabs"
        activeKey={this.selectedTab}
        onSelect={(selectedTab: string) => {
          this.selectedTab = (selectedTab as unknown) as TabKey;
        }}
      >
        <Row>
          <Col sm={2}>
            <Nav variant="pills" className="flex-column">
              {this.tabKeys.map(tabKey => (
                <Nav.Item key={tabKey}>
                  <Nav.Link eventKey={tabKey}>{TAB_TITLES[tabKey]}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>
          <Col sm={10}>
            <Tab.Content>
              {this.tabKeys.map(tabKey => (
                <Tab.Pane eventKey={tabKey} key={tabKey}>
                  {this.getTabPane(tabKey)}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
  }
}
