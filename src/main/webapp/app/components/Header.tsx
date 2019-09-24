import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import oncokbImg from '../resources/images/oncokb-lg.png';

import { observer } from 'mobx-react';
import { AccountMenu } from 'app/pages/menus';
import WindowStore from 'app/store/WindowStore';
import { observable, action } from 'mobx';
import autobind from 'autobind-decorator';

export interface IHeaderProps {
  isUserAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isSwaggerEnabled: boolean;
  windowStore: WindowStore;
}

type SubpageLink = {
  title: string;
  link: string;
};

@observer
class Header extends React.Component<IHeaderProps> {
  @observable pageActiveKey = '/';

  private subPages: SubpageLink[] = [
    { title: 'Levels of Evidence', link: 'levels' },
    { title: 'Actionable Genes', link: 'actionableGenes' },
    { title: 'Cancer Genes', link: 'cancerGenes' },
    { title: 'Data Access', link: 'dataAccess' },
    { title: 'About', link: 'about' },
    { title: 'Team', link: 'team' },
    { title: 'News', link: 'news' },
    { title: 'Terms', link: 'terms' }
  ];

  getLink(page: SubpageLink) {
    return (
      <LinkContainer exact to={`/${page.link}`} key={page.title} className={'mr-auto'}>
        <Nav.Link>{page.title}</Nav.Link>
      </LinkContainer>
    );
  }

  @autobind
  @action
  updateActiveKey(eventKey: any) {
    this.pageActiveKey = eventKey;
  }

  public render() {
    return (
      <header className="sticky-top header">
        <Navbar bg="primary" expand="lg" className="navbar-dark main-navbar">
          <Container fluid={!this.props.windowStore.isXLscreen}>
            <Navbar.Brand onClick={() => this.updateActiveKey('/')}>
              <LinkContainer exact to="/">
                <Nav.Link>
                  <img height={38} src={oncokbImg} alt={'OncoKB'} />
                </Nav.Link>
              </LinkContainer>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav activeKey={this.pageActiveKey} onSelect={this.updateActiveKey}>
                {this.subPages.map(page => this.getLink(page))}
                <AccountMenu isAuthenticated={this.props.isUserAuthenticated} />
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }
}

export default Header;
