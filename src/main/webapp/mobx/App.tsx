import * as React from 'react';
import Main from './pages/Main';

import 'bootstrap/dist/css/bootstrap.css';
import 'cbioportal-frontend-commons/styles.css';
import 'font-awesome/css/font-awesome.css';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Main />
      </div>
    );
  }
}

export default App;
