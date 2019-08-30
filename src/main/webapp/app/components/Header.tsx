import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';

import MskccLogo from './MskccLogo';
import oncokbImg from '../resources/images/oncokb-lg.png';

import './Header.css';

class Header extends React.Component<{}> {
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
              <Nav>
                <LinkContainer exact to="/">
                  <Nav.Link>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer exact to="/about">
                  <Nav.Link>About</Nav.Link>
                </LinkContainer>
              </Nav>
            </Navbar.Collapse>
            <MskccLogo imageHeight={50} className="d-none d-lg-block ml-auto" />
          </Container>
        </Navbar>
      </header>
    );
  }
}

export default Header;
