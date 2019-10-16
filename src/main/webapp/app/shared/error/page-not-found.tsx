import React from 'react';
import { Alert } from 'react-bootstrap';

class PageNotFound extends React.Component {
  render() {
    return (
      <div>
        <Alert variant="danger">The page does not exist.</Alert>
      </div>
    );
  }
}

export default PageNotFound;
