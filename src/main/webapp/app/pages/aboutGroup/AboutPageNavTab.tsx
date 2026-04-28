import * as React from 'react';
import AppStore from 'app/store/AppStore';
import { inject, observer } from 'mobx-react';
import { PAGE_ROUTE, PAGE_TITLE, SOP_LINK } from 'app/config/constants';
import { RouterStore } from 'mobx-react-router';
import { AboutPage } from 'app/pages/AboutPage';
import { TeamPage } from 'app/pages/teamPage/TeamPage';
import Iframe from 'react-iframe';
import FdaRecognitionPage from 'app/pages/aboutGroup/FdaRecognitionPage';
import { getPageTitle } from 'app/shared/utils/Utils';
import { Helmet } from 'react-helmet-async';
import PrivacyPage from '../PrivacyPage';

type AboutPageNavTabProps = { appStore: AppStore; routing: RouterStore };

@inject('appStore', 'routing')
@observer
export class AboutPageNavTab extends React.Component<AboutPageNavTabProps> {
  render() {
    switch (this.props.routing.location.pathname) {
      case PAGE_ROUTE.TEAM:
        return <TeamPage />;
      case PAGE_ROUTE.FDA_RECOGNITION:
        return <FdaRecognitionPage />;
      case PAGE_ROUTE.SOP:
        return (
          <div>
            <Helmet>
              <title>{getPageTitle(PAGE_TITLE.SOP)}</title>
            </Helmet>
            <div style={{ marginTop: '-5px' }}>
              <Iframe
                width="100%"
                height="1000px"
                url={`${SOP_LINK}?contentOnly=true`}
                frameBorder={0}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        );
      case PAGE_ROUTE.PRIVACY:
        return <PrivacyPage />;
      case PAGE_ROUTE.ABOUT:
      default:
        return (
          <AboutPage
            appStore={this.props.appStore}
            routing={this.props.routing}
          />
        );
    }
  }
}
