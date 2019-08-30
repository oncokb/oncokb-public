import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';
import About from './About';
import Home from './Home';

class Main extends React.Component<{}> {
  public render() {
    const HomePage = () => <Home content={'test'} />;

    return (
      <BrowserRouter>
        <div className="Main">
          <Header />
          <div
            style={{
              marginLeft: '2rem',
              marginRight: '2rem',
              paddingTop: 20,
              paddingBottom: 100,
              fontSize: '1.25rem',
              color: '#2c3e50'
            }}
          >
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/about" component={About} />
            </Switch>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

export default Main;
