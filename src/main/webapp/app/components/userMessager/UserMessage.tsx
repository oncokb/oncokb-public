import * as React from 'react';
import { observer } from 'mobx-react';
import {
  action,
  observable,
  computed,
  reaction,
  IReactionDisposer,
  toJS,
} from 'mobx';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { Container } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import {
  DISABLE_BANNER_OPT,
  ONCOKB_TM,
  PAGE_ROUTE,
} from 'app/config/constants';
import { Link } from 'react-router-dom';
import AppStore from 'app/store/AppStore';
import { Linkout } from 'app/shared/links/Linkout';
import { COLOR_BLACK, COLOR_DARK_BLUE, COLOR_WARNING } from 'app/config/theme';
import {
  LinkedInLink,
  UserGoogleGroupLink,
} from 'app/shared/links/SocialMediaLinks';

export interface IUserMessage {
  dateStart?: number;
  dateEnd: number;
  content: JSX.Element;
  backgroundColor?: string;
  color?: string;
  id: string;
}

function makeMessageKey(id: string) {
  return `oncokbMessageKey-${id}`;
}

// ADD MESSAGE IN FOLLOWING FORMAT
// UNIQUE ID IS IMPORTANT B/C WE REMEMBER A MESSAGE HAS BEEN SHOWN
// BASED ON USERS LOCALSTORAGE
let MESSAGE_DATA: IUserMessage[] = [];

if (
  ['beta.oncokb.org', 'www.oncokb.org', 'localhost'].includes(
    window.location.hostname
  )
) {
  MESSAGE_DATA = [
    // ADD MESSAGE IN FOLLOWING FORMAT
    // UNIQUE ID IS IMPORTANT B/C WE REMEMBER A MESSAGE HAS BEEN SHOWN
    // BASED ON USERS LOCALSTORAGE
    {
      dateEnd: 1745784000000,
      content: (
        <div>
          Join us at AACR 2025! Visit our poster session (Sun 4/27, 2-5PM CDT,
          Section 46, Poster 6) to see the latest developments from {ONCOKB_TM}.
          See you there!
        </div>
      ),
      id: '2025-aacr',
    },
    {
      dateEnd: 1735689600000,
      content: (
        <div>
          <div>
            <span>
              Follow us on <LinkedInLink /> or subscribe to our{' '}
              <UserGoogleGroupLink>low-volume email list</UserGoogleGroupLink>,
              to stay updated on our latest data releases and new features!
            </span>
          </div>
        </div>
      ),
      id: '2024-social-accounts-message',
    },
    {
      dateEnd: 1705276800000,
      content: (
        <div>
          <div>
            <span>
              Happy Holidays to you and your loved ones from the OncoKB Team. We
              had a very productive year, and we look forward to further
              improving OncoKB in 2024. 🎄🌟🎄🌟
            </span>
          </div>
        </div>
      ),
      backgroundColor: '#C3E2FF',
      color: COLOR_DARK_BLUE,
      id: '2023-holiday-message',
    },
    {
      dateEnd: 1,
      content: (
        <div>
          <span>Check out our latest publication in Cancer Discovery, </span>
          <Linkout
            link={
              'https://aacrjournals.org/cancerdiscovery/article/doi/10.1158/2159-8290.CD-23-0467/729589/Quantifying-the-Expanding-Landscape-of-Clinical'
            }
          >
            Quantifying the Expanding Landscape of Clinical Actionability for
            Patients with Cancer
          </Linkout>
          <span>, and visit our new </span>
          <Link to={PAGE_ROUTE.ONCOLOGY_TX}>Oncology Therapies page!</Link>
        </div>
      ),
      id: '2023-precision-oncology-therapies',
    },
    {
      dateEnd: 1,
      content: (
        <div>
          <span>
            We have a new Scientist/Scientific Writer-Editor position open. Come
            and join us!{' '}
          </span>
          <a
            className="btn btn-primary btn-sm ml-2 user-messager-container-button"
            target="_blank"
            rel="noopener noreferrer"
            href="https://careers.mskcc.org/vacancies/2022-63146-scientific-writer-editor/"
          >
            Apply Here
          </a>
        </div>
      ),
      id: '2022_sswe_job_hiring',
    },
    {
      dateEnd: 1,
      content: (
        <span>
          Part of {ONCOKB_TM}’s content is now FDA-recognized. For more details,
          please see our{' '}
          <Link to={PAGE_ROUTE.FDA_RECOGNITION}>FDA Recognition</Link> page.
        </span>
      ),
      id: '2021-fda-recognition',
    },
    {
      dateEnd: 1732406400000,
      content: (
        <div>
          Join us November 19-23 at AMP 2024! Visit our poster (#I033) or stop
          by our booth (#1421) to meet our team and explore the latest
          developments from OncoKB™. See you there!
        </div>
      ),
      id: '2024_amp',
    },
    {
      dateStart: 1709337600000,
      dateEnd: 1710028800000,
      content: (
        <div>
          <b>Attention</b>: We want to inform you of an upcoming infrastructure
          update that may lead to a temporary service disruption, planned{' '}
          <b>March 9th, 9AM-12PM</b>.
          <br />
          During this period, you may experience intermittent service
          interruptions, brief outages, or slower response times while accessing
          our services. Thank you for your understanding and cooperation as we
          strive to provide you with an improved service experience.
        </div>
      ),
      backgroundColor: COLOR_WARNING,
      color: COLOR_BLACK,
      id: 'warning_msg_11252023',
    },
  ];
}

type UserMessageProps = {
  dataUrl?: string;
  show: boolean;
  windowStore: WindowStore;
  appStore: AppStore;
};
@observer
export default class UserMessage extends React.Component<UserMessageProps> {
  constructor(props: UserMessageProps) {
    super(props);
    this.reactions.push(
      reaction(
        () => this.showBeVisible,
        newVal => {
          this.props.appStore.userMessageBannerEnabled = newVal;
        },
        false
      )
    );
    this.messages = this.getMessages();
  }

  componentWillUnmount(): void {
    for (const reactionItem of this.reactions) {
      reactionItem();
    }
  }

  readonly reactions: IReactionDisposer[] = [];

  @observable messages: IUserMessage[] = [];

  getMessages() {
    if (localStorage.getItem(DISABLE_BANNER_OPT) === 'true') {
      return [];
    }
    return MESSAGE_DATA.filter(message => {
      const notYetShown = !localStorage.getItem(makeMessageKey(message.id));
      const toBeShown = message.dateStart
        ? Date.now() >= message.dateStart
        : true;
      const expired = Date.now() > message.dateEnd;
      return notYetShown && toBeShown && !expired;
    }).sort((a, b) => a.dateEnd - b.dateEnd);
  }

  @action
  markMessageDismissed(messageId: string) {
    localStorage.setItem(makeMessageKey(messageId), 'shown');
    this.messages = this.getMessages();
  }

  @computed
  get showBeVisible() {
    return this.props.show && this.messages.length > 0;
  }

  render() {
    if (this.showBeVisible) {
      return toJS(this.messages).map(message => (
        <div
          className={styles.message}
          key={message.id}
          style={{
            backgroundColor: message.backgroundColor,
            color: message.color,
          }}
        >
          <Container
            fluid={!this.props.windowStore.isXLscreen}
            className={styles.messageContainer}
          >
            <div>{message.content}</div>
            <i
              className={classNames(styles.close, 'fa', 'fa-close')}
              onClick={() => this.markMessageDismissed(message.id)}
            />
          </Container>
        </div>
      ));
    } else {
      return null;
    }
  }
}
