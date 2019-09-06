import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import LoginContent from 'app/components/login/login-content';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { inject, observer } from 'mobx-react';

export interface ILoginProps extends RouteComponentProps {
  authenticationStore: AuthenticationStore;
}

const Login = inject('authenticationStore')((props: ILoginProps) => {
  const handleLogin = (username: string, password: string, rememberMe = false) => props.authenticationStore.login(username, password);

  const { from } = props.location.state || { from: { pathname: '/', search: location.search } };
  if (props.authenticationStore.isAuthenticated) {
    props.authenticationStore.loginError = false;
    return <Redirect to={from} />;
  }
  return <LoginContent handleLogin={handleLogin} loginError={props.authenticationStore.loginError} />;
});

export default observer(Login);
