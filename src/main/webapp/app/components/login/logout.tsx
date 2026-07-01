import React from 'react';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react';
import { Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { PAGE_ROUTE } from 'app/config/constants';

@inject('authenticationStore')
@observer
export class Logout extends React.Component<{
  authenticationStore: AuthenticationStore;
}> {
  private redirectHome = false;

  componentDidMount() {
    const shouldLogoutFromKeycloak = this.props.authenticationStore.isMskUser;
    this.props.authenticationStore.logout();
    if (shouldLogoutFromKeycloak) {
      window.location.href = '/oauth2/logout';
      return;
    }
    this.redirectHome = true;
    this.forceUpdate();
  }

  render() {
    if (this.redirectHome) {
      return <Redirect to={PAGE_ROUTE.HOME} />;
    }

    return (
      <Row className="justify-content-center">
        <h4>Logging out...</h4>
      </Row>
    );
  }
}
