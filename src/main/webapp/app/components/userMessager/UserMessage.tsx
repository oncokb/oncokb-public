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
  ['beta.oncokb.org', 'www.oncokb.org', 'localhost'].includes(
    getBrowserWindow().location.hostname
  )
) {
  MESSAGE_DATA = [
    // ADD MESSAGE IN FOLLOWING FORMAT
    // UNIQUE ID IS IMPORTANT B/C WE REMEMBER A MESSAGE HAS BEEN SHOWN
    // BASED ON USERS LOCALSTORAGE
    {
      dateEnd: 100000000000000,
      content: `
        <div>
          <div>We are excited to announce two upcoming OncoKB webinars.</div>
          <ol style="margin-bottom: 0;">
              <li><strong>June 30th, 12PM JST, for the Asia/Pacific region</strong>: Utilizing OncoKB, MSK’s Precision Oncology Knowledgebase. <a class="btn btn-primary btn-sm ml-2 user-messager-container-button" target="_blank" href="https://meetmsk.zoom.us/webinar/register/WN_y8keM-CnTpmJ8vn0G0rhBA">Click here to register!</a></li>
              <li><strong>June 30th, 1 PM EST</strong>: Utilizing APIs for annotation of variants in cancer. <a class="btn btn-primary btn-sm ml-2 user-messager-container-button" target="_blank" href="https://meetmsk.zoom.us/webinar/register/WN_sduHSX3yTcaD2NKvDqTwAw">Click here to register!</a></li>
          </ol>
        </div>
        `,
      id: '2020_spring_webinars'
    }
  ];
}

@observer
export default class UserMessage extends React.Component<
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
        <div className={styles.message}>
          <Container
            fluid={!this.props.windowStore.isXLscreen}
            className={styles.messageContainer}
          >
            <div
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
