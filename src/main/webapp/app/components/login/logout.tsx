import React from 'react';
import AuthenticationStore from 'app/store/AuthenticationStore';

export class Logout extends React.Component<{ authenticationStore: AuthenticationStore }> {
  componentDidMount() {
    this.props.authenticationStore.logout();
  }

  render() {
    const logoutUrl = this.props.authenticationStore.logoutUrl;
    if (logoutUrl) {
      // if Keycloak, logoutUrl has protocol/openid-connect in it
      window.location.href =
        logoutUrl.indexOf('/protocol') > -1
          ? logoutUrl + '?redirect_uri=' + window.location.origin
          : logoutUrl + '?id_token_hint=' + this.props.authenticationStore.idToken + '&post_logout_redirect_uri=' + window.location.origin;
    }

    return (
      <div className="p-5">
        <h4>Logged out successfully!</h4>
      </div>
    );
  }
}
