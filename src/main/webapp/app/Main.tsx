import * as React from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { observer } from 'mobx-react';
import AppRouts from 'app/routes/routes';
import { isAuthorized } from 'app/shared/auth/AuthUtils';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { Stores } from 'app/App';
import { Prompt, withRouter } from 'react-router';
import {
  AUTHORITIES,
  DEFAULT_FEEDBACK_ANNOTATION,
  NOTIFICATION_TIMEOUT_MILLISECONDS,
} from 'app/config/constants';
import { ToastContainer } from 'react-toastify';
import { computed } from 'mobx';
import { FeedbackModal } from './components/feedback/FeedbackModal';
import { FdaModal } from 'app/components/fdaModal/FdaModal';
import { Location } from 'history';
import autobind from 'autobind-decorator';

export type IMainPage = Stores;

// @ts-ignore
@withRouter
@observer
class Main extends React.Component<IMainPage> {
  @computed get feedbackAnnotation() {
    const annotation = DEFAULT_FEEDBACK_ANNOTATION;
    if (this.props.authenticationStore.account) {
      annotation.email = this.props.authenticationStore.account.email;
      annotation.name = `${this.props.authenticationStore.account.firstName} ${this.props.authenticationStore.account.lastName}`;
    }
    return {
      ...annotation,
      ...this.props.appStore.feedbackAnnotation,
    };
  }

  @autobind
  handleBlockedNavigation(nextLocation: Location): boolean {
    if (
      !this.props.appStore.showFdaModal &&
      this.props.appStore.inFdaRecognizedContent
    ) {
      if (this.props.appStore.toFdaRecognizedContent) {
        this.props.appStore.toFdaRecognizedContent = false;
        return true;
      } else {
        this.props.appStore.showFdaModal = true;
        this.props.appStore.fdaRedirectLastLocation = nextLocation;
        return false;
      }
    }
    return true;
  }

  @autobind
  afterConfirm() {
    this.props.appStore.showFdaModal = false;
    this.props.appStore.inFdaRecognizedContent = false;
  }

  public render() {
    return (
      <div className="Main">
        <ToastContainer
          position="top-center"
          autoClose={NOTIFICATION_TIMEOUT_MILLISECONDS}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Header
          isUserAuthenticated={
            this.props.authenticationStore.isUserAuthenticated
          }
          isAdmin={
            this.props.authenticationStore.isUserAuthenticated &&
            isAuthorized(
              this.props.authenticationStore.account
                ? this.props.authenticationStore.account.authorities
                : [],
              [AUTHORITIES.ADMIN]
            )
          }
          ribbonEnv={''}
          isInProduction={false}
          isSwaggerEnabled
          windowStore={this.props.windowStore}
          authStore={this.props.authenticationStore}
          routing={this.props.routing}
        />
        <div className={'view-wrapper'}>
          <Container fluid={!this.props.windowStore.isXLscreen}>
            <AppRouts
              authenticationStore={this.props.authenticationStore}
              appStore={this.props.appStore}
              routing={this.props.routing}
            />
          </Container>
        </div>
        <FeedbackModal
          showModal={this.props.appStore.showFeedbackFormModal}
          feedback={this.feedbackAnnotation}
          onHideModal={() => {
            this.props.appStore.showFeedbackFormModal = false;
            this.props.appStore.feedbackAnnotation = undefined;
          }}
        />
        <Prompt
          when={this.props.appStore.inFdaRecognizedContent}
          message={this.handleBlockedNavigation}
        />
        <FdaModal
          routing={this.props.routing}
          show={this.props.appStore.showFdaModal}
          onHide={this.afterConfirm}
          lastLocation={this.props.appStore.fdaRedirectLastLocation}
        />
        <Footer
          lastDataUpdate={this.props.appStore.appInfo.result.dataVersion.date}
        />
      </div>
    );
  }
}

export default Main;
