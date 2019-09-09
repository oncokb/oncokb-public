import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';

import oncokbImg from '../resources/images/oncokb-lg.png';

import './Header.css';
import { observer } from 'mobx-react';
import { AccountMenu } from 'app/pages/menus';

export interface IHeaderProps {
  isUserAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isSwaggerEnabled: boolean;
}

@observer
class Header extends React.Component<IHeaderProps> {
  public render() {
    return (
      <header className="sticky-top">
        <Navbar bg="mskcc-header" expand="lg" className="navbar-dark main-navbar">
          <Container>
            <Navbar.Brand>
              <Link to="/" className="brand-title-link">
                <img className="logo-brand" width={100} src={oncokbImg} alt={'OncoKB'} />
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav className="d-flex">
                <LinkContainer exact to="/">
                  <Nav.Link>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer exact to="/about" className="mr-auto">
                  <Nav.Link>About</Nav.Link>
                </LinkContainer>
                <LinkContainer exact to="/dataAccess" className="mr-auto">
                  <Nav.Link>Data Access</Nav.Link>
                </LinkContainer>
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
