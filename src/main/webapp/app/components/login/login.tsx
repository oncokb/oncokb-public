import React from 'react';
import { Redirect } from 'react-router-dom';

import LoginContent from 'app/components/login/login-content';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';

export interface ILoginProps {
  authenticationStore: AuthenticationStore;
  routing: RouterStore;
}

const Login = inject('authenticationStore', 'routing')(observer((props: ILoginProps) => {
  const handleLogin = (username: string, password: string, rememberMe = false) => props.authenticationStore.login(username, password, rememberMe);

  const { from } = props.routing.location.state || { from: { pathname: '/', search: location.search } };
  if (props.authenticationStore.isUserAuthenticated) {
    props.authenticationStore.loginError = false;
    return <Redirect to={from} />;
  }
  return <LoginContent handleLogin={handleLogin} loginError={props.authenticationStore.loginError} />;
}));

export default Login;
