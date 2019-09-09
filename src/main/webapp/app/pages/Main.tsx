import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import AppStore from 'app/store/AppStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { observer, inject } from 'mobx-react';
import { AUTHORITIES } from '../../app-backup/config/constants';
import AppRouts from 'app/routes';
import { isAuthorized } from 'app/shared/auth/AuthUtils';

export interface IMainPage {
  appStore: AppStore;
  authenticationStore: AuthenticationStore;
}

@inject('appStore', 'authenticationStore')
@observer
class Main extends React.Component<IMainPage> {
  public render() {
    return (
      <BrowserRouter>
        <div className="Main">
          <Header
            isUserAuthenticated={this.props.authenticationStore.isUserAuthenticated}
            isAdmin={
              this.props.authenticationStore.account &&
              isAuthorized(this.props.authenticationStore.account.authorities, [AUTHORITIES.ADMIN])
            }
            ribbonEnv={''}
            isInProduction={false}
            isSwaggerEnabled
          />
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
            <AppRouts />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

export default Main;
