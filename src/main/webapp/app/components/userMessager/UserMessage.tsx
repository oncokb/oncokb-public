import * as React from 'react';
import { observer } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import {
  action,
  observable,
  computed,
  reaction,
  IReactionDisposer,
} from 'mobx';
import autobind from 'autobind-decorator';
import * as _ from 'lodash';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { Container } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import { DISABLE_BANNER_OPT, PAGE_ROUTE } from 'app/config/constants';
import TextScroller from 'app/shared/texts/TextScroller';
import { Link } from 'react-router-dom';
import AppStore from 'app/store/AppStore';

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
let MESSAGE_DATA: IUserMessage[];

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
            We have a new Software Engineer position open. Come and join us!{' '}
          </span>
          <a
            className="btn btn-primary btn-sm ml-2 user-messager-container-button"
            target="_blank"
            rel="noopener noreferrer"
            href="https://careers.mskcc.org/jobs/job-details/2021-48797-software-engineer-oncokb"
          >
            Apply Here
          </a>
        </div>
      ),
      id: '2021_se_job_hiring',
    },
    {
      dateEnd: 100000000000000,
      content: (
        <TextScroller
          text={
            <span>
              Part of OncoKB’s content is now FDA-recognized. For more details,
              please see our{' '}
              <Link
                to={PAGE_ROUTE.FDA_RECOGNITION}
                style={{ color: 'white', textDecoration: 'underline' }}
              >
                FDA Recognition
              </Link>{' '}
              page.
            </span>
          }
        />
      ),
      id: '2021-fda-recognition',
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
  }

  componentWillUnmount(): void {
    for (const reactionItem of this.reactions) {
      reactionItem();
    }
  }

  readonly reactions: IReactionDisposer[] = [];

  messageData = remoteData<IUserMessage[]>(async () => {
    return Promise.resolve(MESSAGE_DATA);
  });

  @observable dismissed = false;

  get shownMessage() {
    if (localStorage.getItem(DISABLE_BANNER_OPT) === 'true') {
      return undefined;
    }
    const messageToShow = _.find(this.messageData.result, message => {
      const notYetShown = !localStorage.getItem(makeMessageKey(message.id));
      const expired = Date.now() > message.dateEnd;
      return notYetShown && !expired;
    });

    return messageToShow;
  }

  @autobind
  close() {
    this.markMessageDismissed(this.shownMessage!);
  }

  @action
  markMessageDismissed(message: IUserMessage) {
    localStorage.setItem(makeMessageKey(message.id), 'shown');
    this.dismissed = true;
  }

  @computed
  get showBeVisible() {
    return (
      this.props.show &&
      !this.dismissed &&
      this.messageData.isComplete &&
      !!this.shownMessage
    );
  }

  render() {
    if (this.showBeVisible) {
      return (
        <div className={styles.message}>
          <Container
            fluid={!this.props.windowStore.isXLscreen}
            className={styles.messageContainer}
          >
            <div>{this.shownMessage!.content}</div>
            <i
              className={classNames(styles.close, 'fa', 'fa-close')}
              onClick={this.close}
            />
          </Container>
        </div>
      );
    } else {
      return null;
    }
  }
}
