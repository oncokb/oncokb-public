import * as React from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { observer } from 'mobx-react';
import AppRouts from 'app/routes';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { Container } from 'react-bootstrap';
import { Stores } from 'app/App';
import { withRouter } from 'react-router';
import { AUTHORITIES } from 'app/config/constants';

export type IMainPage = Stores;

// @ts-ignore
@withRouter
@observer
class Main extends React.Component<IMainPage> {
  public render() {
    return (
      <div className="Main">
        <Header
          isUserAuthenticated={this.props.authenticationStore.isUserAuthenticated}
          isAdmin={
            this.props.authenticationStore.isUserAuthenticated &&
            isAuthorized(this.props.authenticationStore.account.result!.authorities, [AUTHORITIES.ADMIN])
          }
          ribbonEnv={''}
          isInProduction={false}
          isSwaggerEnabled
          windowStore={this.props.windowStore}
          routing={this.props.routing}
        />
        <div className={'view-wrapper'}>
          <Container fluid={!this.props.windowStore.isXLscreen}>
            <span>Current pathname: {this.props.routing.location.pathname}</span>
            <AppRouts authenticationStore={this.props.authenticationStore} routing={this.props.routing} />
          </Container>
        </div>
        <Footer lastUpdate={this.props.appStore.appInfo.result.dataVersion.date} />
      </div>
    );
  }
}

export default Main;
