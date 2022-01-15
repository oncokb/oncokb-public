import React from 'react';
import { Alert } from 'react-bootstrap';
import { observer } from 'mobx-react';

const DEFAULT_TITLE = 'This page is temporarily unavailable.';

@observer
export default class ReadOnlyPage extends React.Component {
  render() {
    return (
      <Alert variant="danger" className="text-center">
        <h4>{DEFAULT_TITLE}</h4>
        <div>This page is down for maintenance and will be back shortly.</div>
        <div>We apologize for any inconveniences.</div>
      </Alert>
    );
  }
}
