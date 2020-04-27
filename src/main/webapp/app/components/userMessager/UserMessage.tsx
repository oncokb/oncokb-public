import * as React from 'react';
import { observer } from 'mobx-react';
import { remoteData, isWebdriver } from 'cbioportal-frontend-commons';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import * as _ from 'lodash';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { getBrowserWindow } from 'cbioportal-frontend-commons';
import { Container } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';

export interface IUserMessage {
  dateStart?: number;
  dateEnd: number;
  content: string;
  id: string;
}

function makeMessageKey(id: string) {
  return `portalMessageKey-${id}`;
}

// ADD MESSAGE IN FOLLOWING FORMAT
// UNIQUE ID IS IMPORTANT B/C WE REMEMBER A MESSAGE HAS BEEN SHOWN
// BASED ON USERS LOCALSTORAGE
let MESSAGE_DATA: IUserMessage[];

if (
  ['beta.oncokb.org', 'www.oncokb.org'].includes(
    getBrowserWindow().location.hostname
  )
) {
  MESSAGE_DATA = [
    // ADD MESSAGE IN FOLLOWING FORMAT
    // UNIQUE ID IS IMPORTANT B/C WE REMEMBER A MESSAGE HAS BEEN SHOWN
    // BASED ON USERS LOCALSTORAGE
    {
      dateEnd: 100000000000000,
      content: `Join our webinar to learn how to use OncoKB effectively. First webinar <strong>May 7th 3pm-4pm EDT</strong>. <a class="btn btn-secondary btn-sm ml-2" target="_blank" href="https://meetmsk.zoom.us/meeting/register/vJcvf-CvrzsshBK8VEiD5J9DSRDf7C--qg">Click here to register!</a>`,
      id: '2020_spring_webinar'
    }
  ];
}

@observer
export default class UserMessager extends React.Component<
  {
    dataUrl?: string;
    windowStore: WindowStore;
  },
  {}
> {
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
    if (!this.dismissed && this.messageData.isComplete && this.shownMessage) {
      return (
        <div className={styles.messager}>
          <Container
            fluid={!this.props.windowStore.isXLscreen}
            className={styles.messagerContainer}
          >
            <div
              className={styles.message}
              dangerouslySetInnerHTML={{
                __html: this.shownMessage.content
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
