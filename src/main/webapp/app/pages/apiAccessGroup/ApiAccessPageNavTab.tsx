import * as React from 'react';
import { Row, Col, Tab, Nav } from 'react-bootstrap';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { PAGE_ROUTE, PAGE_TITLE } from 'app/config/constants';
import { observable, IReactionDisposer, reaction, computed } from 'mobx';
import { RouterStore } from 'mobx-react-router';
import APIAccessPage from 'app/pages/apiAccessGroup/APIAccessPage';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { TermsPage } from 'app/pages/apiAccessGroup/TermsPage';
import WindowStore from 'app/store/WindowStore';
import { RegisterPage } from 'app/pages/RegisterPage';
import ReadOnlyMode from 'app/shared/readonly/ReadOnlyMode';

type ApiAccessPageNavTabProps = {
  appStore: AppStore;
  routing: RouterStore;
  authenticationStore: AuthenticationStore;
  windowStore: WindowStore;
};

export enum TabKey {
  API_ACCESS = PAGE_ROUTE.API_ACCESS,
  TERMS = PAGE_ROUTE.TERMS,
  REGISTER = PAGE_ROUTE.REGISTER,
}

const TAB_TITLES: { [key in TabKey]: string } = {
  [TabKey.TERMS]: PAGE_TITLE.TERMS,
  [TabKey.REGISTER]: 'Apply for a license',
  [TabKey.API_ACCESS]: 'API Access',
};

// Wrap the register page with the ReadOnlyMode HOC, so it is disabled
// when application is in read only mode.
const ReadOnlyRegisterPage = ReadOnlyMode(RegisterPage);

@inject('appStore', 'routing', 'authenticationStore', 'windowStore')
@observer
export class ApiAccessPageNavTab extends React.Component<
  ApiAccessPageNavTabProps
> {
  readonly reactions: IReactionDisposer[] = [];
  private tabKeys = [TabKey.API_ACCESS, TabKey.TERMS, TabKey.REGISTER];

  @observable selectedTab: TabKey = TabKey.API_ACCESS;

  constructor(props: ApiAccessPageNavTabProps) {
    super(props);
    reaction(
      () => this.selectedTab,
      newSelectedTab => {
        this.props.routing.history.push({
          pathname: newSelectedTab as any,
          hash: this.props.routing.location.hash,
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

  getTabPane(tabKey: TabKey) {
    switch (tabKey) {
      case TabKey.API_ACCESS:
        return (
          <APIAccessPage
            routing={this.props.routing}
            windowStore={this.props.windowStore}
            authenticationStore={this.props.authenticationStore}
          />
        );
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
      <>
        <Tab.Container
          id="license-page-nav-tabs"
          activeKey={this.selectedTab}
          onSelect={(selectedTab: string) => {
            this.selectedTab = selectedTab as any;
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
      </>
    );
  }
}
