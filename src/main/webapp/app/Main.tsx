import * as React from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { observer } from 'mobx-react';
import { AUTHORITIES } from '../app-backup/config/constants';
import AppRouts from 'app/routes';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { Container } from 'react-bootstrap';
import { Stores } from 'app/App';

export type IMainPage = Stores;

@observer
class Main extends React.Component<IMainPage> {
  public render() {
    return (
      <div className="Main">
        <Header
          isUserAuthenticated={this.props.authenticationStore.isUserAuthenticated}
          isAdmin={
            this.props.authenticationStore.account && isAuthorized(this.props.authenticationStore.account.authorities, [AUTHORITIES.ADMIN])
          }
          ribbonEnv={''}
          isInProduction={false}
          isSwaggerEnabled
          windowStore={this.props.windowStore}
        />
        <div className={'view-wrapper'}>
          <Container fluid={!this.props.windowStore.isXLscreen}>
            <span>Current pathname: {this.props.routing.location.pathname}</span>
            <AppRouts />
          </Container>
        </div>
        <Footer lastUpdate={this.props.appStore.appInfo.result.dataVersion.date} />
      </div>
    );
  }
}

export default Main;
