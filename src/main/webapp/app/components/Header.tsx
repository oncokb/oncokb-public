import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';

import oncokbImg from '../resources/images/oncokb-lg.png';

import { observer } from 'mobx-react';
import { AccountMenu } from 'app/pages/menus';

export interface IHeaderProps {
  isUserAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isSwaggerEnabled: boolean;
}

type SubpageLink = {
  title: string;
  link: string;
};

@observer
class Header extends React.Component<IHeaderProps> {
  private subPages: SubpageLink[] = [
    { title: 'Levels of Evidence', link: 'levels' },
    { title: 'Actionable Genes', link: 'actionableGenes' },
    { title: 'Cancer Genes', link: 'cnacerGenes' },
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

  public render() {
    return (
      <header className="sticky-top">
        <Navbar bg="primary" expand="lg" className="navbar-dark main-navbar">
          <Container>
            <Navbar.Brand>
              <Link to="/">
                <img height={38} src={oncokbImg} alt={'OncoKB'} />
              </Link>
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
