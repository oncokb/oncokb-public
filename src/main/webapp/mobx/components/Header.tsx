import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';

import MskccLogo from './MskccLogo';

import './Header.css';

class Header extends React.Component<{}> {
  public render() {
    return (
      <header className="sticky-top">
        <Navbar bg="mskcc-header" expand="lg" className="navbar-dark main-navbar">
          <Container>
            <Navbar.Brand>
              <Link to="/" className="brand-title-link">
                <i className="fa fa-arrow-up" style={{ color: '#FF9900' }} /> INSIGHT
              </Link>
            </Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Nav>
                <LinkContainer exact={true} to="/">
                  <Nav.Link>Home</Nav.Link>
                </LinkContainer>
                <LinkContainer exact={true} to="/about">
                  <Nav.Link>About</Nav.Link>
                </LinkContainer>
                <LinkContainer exact={true} to="/download">
                  <Nav.Link>Download</Nav.Link>
                </LinkContainer>
              </Nav>
            </Navbar.Collapse>
            <MskccLogo imageHeight={50} className="d-none d-lg-block ml-auto" />
          </Container>
        </Navbar>
        <Navbar bg="mskcc-subheader" expand="lg" className="navbar-dark sub-navbar">
          <Container>A resource for the integration of somatic with germline heritability in tumorigenesis</Container>
        </Navbar>
      </header>
    );
  }
}

export default Header;
