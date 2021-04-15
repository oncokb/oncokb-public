import * as React from 'react';
import { observer } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import { action, observable } from 'mobx';
import autobind from 'autobind-decorator';
import * as _ from 'lodash';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { Container } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';

export interface IUserMessage {
  dateStart?: number;
  dateEnd: number;
  content: string;
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
      dateEnd: 1619064000000,
      content: `
        <div>
          <span>We have a new Software Engineer position open. Come and join us! </span>
          <a class="btn btn-primary btn-sm ml-2 user-messager-container-button" target="_blank" href="https://careers.mskcc.org/jobs/job-details/2021-48797-software-engineer-oncokb">Apply Here</a>
        </div>
        `,
      id: '2021_se_job_hiring',
    },
  ];
}

type UserMessageProps = {
  dataUrl?: string;
  show: boolean;
  windowStore: WindowStore;
};
@observer
export default class UserMessage extends React.Component<UserMessageProps> {
  constructor(props: UserMessageProps) {
    super(props);
  }

  messageData = remoteData<IUserMessage[]>(async () => {
    return Promise.resolve(MESSAGE_DATA);
  });

  @observable dismissed = false;

  get shownMessage() {
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

  render() {
    if (
      this.props.show &&
      !this.dismissed &&
      this.messageData.isComplete &&
      this.shownMessage
    ) {
      return (
        <div className={styles.message}>
          <Container
            fluid={!this.props.windowStore.isXLscreen}
            className={styles.messageContainer}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: this.shownMessage.content,
              }}
            ></div>
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
