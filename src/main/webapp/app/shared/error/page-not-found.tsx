import React from 'react';
import { Alert } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { PAGE_ROUTE, REDIRECT_TIMEOUT_MILLISECONDS } from 'app/config/constants';
import { Redirect } from 'react-router';

@observer
export default class PageNotFound extends React.Component {
  @observable shouldBeRedirect = false;

  constructor(props: {}) {
    super(props);
    setTimeout(() => (this.shouldBeRedirect = true), REDIRECT_TIMEOUT_MILLISECONDS);
  }

  render() {
    return (
      <div>
        {this.shouldBeRedirect ? (
          <Redirect to={PAGE_ROUTE.HOME} />
        ) : (
          <Alert variant="danger">The page does not exist. You will be redirected to home page.</Alert>
        )}
      </div>
    );
  }
}
