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
import { DISABLE_BANNER_OPT } from 'app/config/constants';
import AppStore from 'app/store/AppStore';
import client from 'app/shared/api/clientInstance';
import { UserBannerMessageDTO } from 'app/shared/api/generated/API';
import { RouteComponentProps, withRouter } from 'react-router';

// Capture either a markdown link ([text](href)) or a markdown bold pair (**text**).
// Group 1/2 == link text/URL. Group 3 == bold content.
const MARKDOWN_LINK_OR_BOLD_REGEX = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

type IUserMessage = {
  startDate: number;
  endDate: number;
  content: string;
  id: string;
  bannerType: UserBannerMessageDTO['bannerType'];
};

function makeMessageKey(id: string) {
  return `oncokbMessageKey-${id}`;
}

function createTextNodes(text: string, keyPrefix: string) {
  return text.split(/(\n)/).map((segment, index) => {
    if (segment === '\n') {
      return <br key={`${keyPrefix}-br-${index}`} />;
    }
    return (
      <React.Fragment key={`${keyPrefix}-txt-${index}`}>
        {segment}
      </React.Fragment>
    );
  });
}

function renderBannerContent(content: string) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MARKDOWN_LINK_OR_BOLD_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...createTextNodes(
          content.substring(lastIndex, match.index),
          `text-${nodes.length}`
        )
      );
    }

    if (match[1] && match[2]) {
      const [, text, href] = match;
      nodes.push(
        <a
          key={`link-${nodes.length}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      );
    } else if (match[3]) {
      const boldText = match[3];
      nodes.push(
        <b key={`bold-${nodes.length}`}>
          {createTextNodes(boldText, `bold-${nodes.length}`)}
        </b>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    nodes.push(
      ...createTextNodes(content.substring(lastIndex), `text-${nodes.length}`)
    );
  }

  return nodes.length ? nodes : content;
}

type UserMessageBaseProps = {
  dataUrl?: string;
  show: boolean;
  windowStore: WindowStore;
  appStore: AppStore;
};

type UserMessageProps = UserMessageBaseProps & RouteComponentProps;

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }
  const parsedDate = Date.parse(value);
  return Number.isNaN(parsedDate) ? undefined : parsedDate;
}

function transformBannerMessage(
  bannerMessage: UserBannerMessageDTO
): IUserMessage | undefined {
  if (!bannerMessage.id || !bannerMessage.content) {
    return undefined;
  }
  const endDate = parseDate(bannerMessage.endDate);
  if (!endDate) {
    return undefined;
  }
  const startDate = parseDate(bannerMessage.startDate);
  if (!startDate) {
    return undefined;
  }
  return {
    id: `${bannerMessage.id}`,
    content: bannerMessage.content,
    endDate,
    startDate,
    bannerType: bannerMessage.bannerType || 'INFO',
  };
}

@observer
class UserMessage extends React.Component<UserMessageProps> {
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

  componentDidMount(): void {
    this.loadBannerMessages();
  }

  componentDidUpdate(prevProps: Readonly<UserMessageProps>): void {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.loadBannerMessages();
    }
  }

  componentWillUnmount(): void {
    for (const reactionItem of this.reactions) {
      reactionItem();
    }
  }

  readonly reactions: IReactionDisposer[] = [];

  @observable.ref bannerMessages: IUserMessage[] = [];

  @observable messages: IUserMessage[] = [];

  private loadBannerMessages() {
    client
      .getActiveUserBannerMessagesUsingGET({})
      .then(this.applyBannerMessages, error => {
        console.error('Failed to load user banner messages', error);
      });
  }

  @action.bound
  private applyBannerMessages(bannerMessages: UserBannerMessageDTO[] = []) {
    this.bannerMessages = bannerMessages
      .map(transformBannerMessage)
      .filter((message): message is IUserMessage => Boolean(message));
    this.messages = this.getMessages();
  }

  getMessages() {
    if (localStorage.getItem(DISABLE_BANNER_OPT) === 'true') {
      return [];
    }
    return this.bannerMessages;
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
          className={classNames(styles.message, {
            [styles.alert]: message.bannerType === 'ALERT',
          })}
          key={message.id}
        >
          <Container
            fluid={!this.props.windowStore.isXLscreen}
            className={styles.messageContainer}
          >
            <div>{renderBannerContent(message.content)}</div>
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

export default withRouter(UserMessage);
