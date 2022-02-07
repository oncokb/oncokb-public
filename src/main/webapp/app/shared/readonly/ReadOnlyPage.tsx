import React from 'react';
import { Alert } from 'react-bootstrap';
import { observer } from 'mobx-react';

@observer
export default class ReadOnlyPage extends React.Component {
  render() {
    return (
      <Alert variant="danger" className="text-center">
        <h4>This page is temporarily unavailable.</h4>
        <div>This page is down for maintenance and will be back shortly.</div>
        <div>We apologize for any inconveniences.</div>
      </Alert>
    );
  }
}
