import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

import oncokbImg from 'content/images/oncokb-lg.png';

import { observer } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { observable, action, reaction, IReactionDisposer } from 'mobx';
import autobind from 'autobind-decorator';
import { RouterStore } from 'mobx-react-router';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import AccountMenu from 'app/pages/menus/account';

export interface IHeaderProps {
  isUserAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isSwaggerEnabled: boolean;
  windowStore: WindowStore;
  routing: RouterStore;
}

type SubpageLink = {
  title: string;
  link: string;
};

// @ts-ignore
@withRouter
@observer
class Header extends React.Component<IHeaderProps> {
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
      <NavLink to={`/${page.link}`} key={page.title} className={'mr-auto nav-item'}>
        {page.title}
      </NavLink>
    );
  }

  public render() {
    return (
      <header className="sticky-top header">
        <Navbar bg="primary" expand="lg" className="navbar-dark main-navbar">
          <Container fluid={!this.props.windowStore.isXLscreen}>
            <Navbar.Brand>
              <NavLink to="/">
                <img height={38} src={oncokbImg} alt={'OncoKB'} />
              </NavLink>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav>
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
