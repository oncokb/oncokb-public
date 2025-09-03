import * as React from 'react';
import ReactGA from 'react-ga4';

import Main from './Main';
import AppStore, { IAppConfig } from 'app/store/AppStore';
import AuthenticationStore from 'app/store/AuthenticationStore';
import { Provider, observer } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { RouterStore, SynchronizedHistory } from 'mobx-react-router';
import { Router } from 'react-router';
import { syncHistoryWithStore } from 'mobx-react-router';
import { createBrowserHistory } from 'history';
import { PAGE_ROUTE } from 'app/config/constants';
import { action } from 'mobx';
import autobind from 'autobind-decorator';
import { setRecaptchaToken } from './indexUtils';
import { AppConfig } from 'app/appConfig';
import { HelmetProvider } from 'react-helmet-async';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
import * as Sentry from '@sentry/react';

export type Stores = {
  appStore: AppStore;
  authenticationStore: AuthenticationStore;
  windowStore: WindowStore;
  routing: RouterStore;
};

@observer
class App extends React.Component {
  readonly stores: Stores = {
    appStore: new AppStore(),
    authenticationStore: new AuthenticationStore(),
    windowStore: new WindowStore(),
    routing: new RouterStore(),
  };
  public recaptchaRef: any = React.createRef();
  public recaptchaRendered = false;
  public recaptchaToken: string;

  constructor(props: IAppConfig) {
    super(props);
    this.stores.windowStore.registerOnClickEvent(this.executeRecaptcha);
  }

  @autobind
  @action
  public executeRecaptcha() {
    if (
      !this.stores.appStore.recaptchaVerified &&
      !this.stores.authenticationStore.isUserAuthenticated &&
      this.stores.routing.location.pathname !== PAGE_ROUTE.HOME &&
      this.recaptchaRef &&
      this.recaptchaRendered
    ) {
      this.recaptchaRef.current.execute();
    }
  }

  @autobind
  @action
  onRecaptchaVerify(value: string) {
    const response = this.recaptchaRef.current.getResponse();
    response.then((token: string) => {
      setRecaptchaToken(token);
      this.recaptchaToken = token;
    });
    this.stores.appStore.recaptchaVerified = true;
  }

  @autobind
  @action
  onRecaptchaRender() {
    this.recaptchaRendered = true;
    this.executeRecaptcha();
  }

  componentDidMount() {
    const consentDescription =
      '<p>We use cookies to operate our website. &nbsp;We also use cookies to improve your site experience and analyze our site’s performance, including through our analytics partners. &nbsp;By clicking “Accept All”, you consent to our use of cookies. &nbsp;You may also manage your cookie preferences by clicking “Manage Cookies”. &nbsp;For more information about how we use cookies please see our <a href="/privacy">OncoKB Privacy Notice</a></p>';
    CookieConsent.run({
      disablePageInteraction: true,
      guiOptions: {
        consentModal: {
          layout: 'cloud inline',
          position: 'bottom center',
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: true,
          autoClear: {
            cookies: [
              {
                name: /^_ga/,
              },
              {
                name: '_gid',
              },
            ],
          },
          services: {
            ga: {
              label: 'Google Analytics',
              onAccept() {
                // Install Google Analytics 4 if GA project id is configured on server side
                if (AppConfig.serverConfig?.googleAnalyticsProjectId) {
                  ReactGA.initialize(
                    AppConfig.serverConfig.googleAnalyticsProjectId
                  );
                }
              },
              onReject() {
                ReactGA.reset();
              },
            },
            gtm: {
              label: 'Google Tag Manager',
            },
            sentry: {
              label: 'Sentry',
              onAccept() {
                if (AppConfig.serverConfig?.sentryProjectId) {
                  Sentry.init({
                    // Adjust tracesSampleRate for production.
                    // For more information, please see https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#tracing-options
                    dsn: AppConfig.serverConfig.sentryProjectId,
                    integrations: [new Sentry.Replay()],
                    environment: 'production',
                    tracesSampleRate: 0.5,
                    replaysOnErrorSampleRate: 1.0,
                    ignoreErrors: [
                      // the following errors are for this project only
                      'ResizeObserver loop limit exceeded',
                      'ResizeObserver loop completed',
                      'Request has been terminated',
                      'Failed to fetch all transcripts',
                      'Non-Error promise rejection captured',

                      // the following are suggested ignores by the community coming from https://gist.github.com/Chocksy/e9b2cdd4afc2aadc7989762c4b8b495a
                      // Random plugins/extensions
                      'top.GLOBALS',
                      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
                      'originalCreateNotification',
                      'canvas.contentDocument',
                      'MyApp_RemoveAllHighlights',
                      'http://tt.epicplay.com',
                      "Can't find variable: ZiteReader",
                      'jigsaw is not defined',
                      'ComboSearch is not defined',
                      'http://loading.retry.widdit.com/',
                      'atomicFindClose',
                      // Facebook borked
                      'fb_xd_fragment',
                      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
                      // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
                      'bmi_SafeAddOnload',
                      'EBCallBackMessageReceived',
                      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
                      'conduitPage',
                      // Generic error code from errors outside the security sandbox
                      // You can delete this if using raven.js > 1.0, which ignores these automatically.
                      'Script error.',
                      // Avast extension error
                      '_avast_submit',
                    ],
                    // Skip the common browser extension ad 3rd party script. List from https://gist.github.com/Chocksy/e9b2cdd4afc2aadc7989762c4b8b495a
                    denyUrls: [
                      new RegExp('.*localhost.*'),
                      // Google Adsense
                      /pagead\/js/i,
                      // Facebook flakiness
                      /graph\.facebook\.com/i,
                      // Facebook blocked
                      /connect\.facebook\.net\/en_US\/all\.js/i,
                      // Woopra flakiness
                      /eatdifferent\.com\.woopra-ns\.com/i,
                      /static\.woopra\.com\/js\/woopra\.js/i,
                      // Chrome extensions
                      /extensions\//i,
                      /^chrome:\/\//i,
                      // Other plugins
                      /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
                      /webappstoolbarba\.texthelp\.com\//i,
                      /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
                    ],

                    // Called for message and error events
                    beforeSend(event) {
                      // identify deprecated API that used for mutation mapper. Do not report such event.
                      // we need to upgrade mutation mapper but it's limited by our node version
                      const hasInvalidUrl =
                        (
                          event.breadcrumbs?.filter(breadcrumb => {
                            const url = breadcrumb.data?.url || '';
                            return url.includes('getMutationAligner.json');
                          }) || []
                        ).length > 0;

                      if (hasInvalidUrl) {
                        return null;
                      } else {
                        return event;
                      }
                    },
                  });
                }
              },
            },
          },
        },
        functionality: {
          enabled: false,
        },
        marketing: {
          enabled: false,
        },
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description: consentDescription,
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage Individual preferences',
            },
            preferencesModal: {
              title: 'Manage cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Accept current selection',
              closeIconLabel: 'Close modal',
              sections: [
                {
                  description: consentDescription,
                },
                {
                  title: 'Strictly Necessary Cookies',
                  description:
                    'Strictly necessary cookies are essential for a website to perform its basic functions.  For example, these cookies may allow users to sign into our website, or to navigate between pages without losing their previous actions on a website. We would not be able to operate our website without using strictly necessary cookies.',

                  linkedCategory: 'necessary',
                },
                {
                  title: 'Performance Cookies',
                  description:
                    'Performance cookies collect information about how users interact with a website. For example, these cookies may determine which pages users visit the most, and whether any pages are not working properly.  We use information collected by performance cookies for various purposes, such as evaluating how users navigate and experience our website in order to improve its design and functionality.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'Functionality',
                  description:
                    'Functionality cookies allow our website to remember your preference settings and make your use of the site easier, such as by remembering your log-in details for your next visit.  They allow us to personalize your experience on our website through enhanced features, such as by displaying text in your chosen language, or delivering content to you that you have expressed interest in. These cookies also allow us to provide services you requested, such as showing you video content.',
                  linkedCategory: 'functionality',
                },
                {
                  title: 'Marketing',
                  description:
                    'Marketing cookies collect information from you in order to allow us to display advertisements to you based on the topics you are interested in. Marketing cookies may allow us or our service providers to display personalized marketing content to you on other websites and applications as well.',
                  linkedCategory: 'marketing',
                },
              ],
            },
          },
        },
      },
    });
  }

  componentWillUnmount(): void {
    this.stores.authenticationStore.destroy();
  }

  // We need to deal with old links that use hash sign before each page
  checkHash(history: SynchronizedHistory) {
    if (
      history.location.hash &&
      history.location.hash.startsWith('#/') &&
      history.location.pathname === '/'
    ) {
      history.replace(history.location.hash.substring(2));
    }
  }

  public render() {
    const browserHistory = createBrowserHistory();
    const history = syncHistoryWithStore(browserHistory, this.stores.routing);

    this.checkHash(history);

    return (
      <HelmetProvider>
        <>
          {
            <Provider {...this.stores}>
              <Router history={history}>
                <Main {...this.stores} />
              </Router>
            </Provider>
          }
        </>
      </HelmetProvider>
    );
  }
}

export default App;
