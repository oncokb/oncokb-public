import * as React from 'react';
import { observer } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import {
  action,
  observable,
  computed,
  reaction,
  IReactionDisposer,
  toJS,
} from 'mobx';
import autobind from 'autobind-decorator';
import * as _ from 'lodash';
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

export interface IUserMessage {
  dateStart?: number;
  dateEnd: number;
  content: JSX.Element;
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
          <Link
            to={PAGE_ROUTE.FDA_RECOGNITION}
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            FDA Recognition
          </Link>{' '}
          page.
        </span>
      ),
      id: '2021-fda-recognition',
    },
    {
      dateEnd: 1686196800000,
      content: (
        <div>
          Join us at ASCO 2023! Visit our booth (
          <Linkout
            link={
              'https://events.jspargo.com/asco23/Public/EventMap.aspx?ver=html&EventID=729&MapID=906&MapItBoothID=887434&MapItBooth=28161'
            }
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            #28161
          </Linkout>
          ) and our{' '}
          <Linkout
            link={'https://meetings.asco.org/abstracts-presentations/219452'}
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            poster
          </Linkout>{' '}
          (Mon 06/05, 1pm, Hall A, Poster Bd #171) to meet our team and explore
          the latest developments from OncoKB™. See you there!
        </div>
      ),
      id: '2023_asco',
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
    return _.filter(MESSAGE_DATA, message => {
      const notYetShown = !localStorage.getItem(makeMessageKey(message.id));
      const expired = Date.now() > message.dateEnd;
      return notYetShown && !expired;
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
        <div className={styles.message} key={message.id}>
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
