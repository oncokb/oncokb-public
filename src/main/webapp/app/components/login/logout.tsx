import React from 'react';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { inject } from 'mobx-react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import { Row } from 'react-bootstrap';

@inject('authenticationStore')
@observer
export class Logout extends React.Component<{ authenticationStore: AuthenticationStore }> {
  @observable redirect = false;

  @action toggleRedirect = () => (this.redirect = !this.redirect);

  componentDidMount() {
    this.props.authenticationStore.logout();
    setTimeout(this.toggleRedirect, 1000);
  }

  render() {
    const logoutUrl = this.props.authenticationStore.logoutUrl;
    if (logoutUrl) {
      // if Keycloak, logoutUrl has protocol/openid-connect in it
      window.location.href =
        logoutUrl.includes('/protocol')
          ? logoutUrl + '?redirect_uri=' + window.location.origin
          : logoutUrl + '?id_token_hint=' + this.props.authenticationStore.idToken + '&post_logout_redirect_uri=' + window.location.origin;
    }

    if (this.redirect) {
      return <Redirect to={'/'} />;
    } else {
      return (
        <Row className="justify-content-center">
          <h4>Logged out successfully!</h4>
        </Row>
      );
    }
  }
}
