import * as React from 'react';
import { observer } from 'mobx-react';
import styles from './styles.module.scss';
import { Container } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';
import AuthenticationStore, {
  ACCOUNT_STATUS,
} from 'app/store/AuthenticationStore';
import { ContactLink } from 'app/shared/links/ContactLink';

@observer
export default class AccountMessage extends React.Component<
  {
    windowStore: WindowStore;
    authStore: AuthenticationStore;
  },
  {}
> {
  render() {
    return this.props.authStore.accountStatus ===
      ACCOUNT_STATUS.TRIAL_ABOUT_2_EXPIRED ? (
      <div className={styles.message}>
        <Container
          fluid={!this.props.windowStore.isXLscreen}
          className={styles.messageContainer}
        >
          <div>
            <i className={'fa fa-warning'}></i>
            <span>
              Your free trial is about to expire. Please reach out to{' '}
              <ContactLink emailSubject={'Apply full Account'} /> for a full
              account.
            </span>
          </div>
        </Container>
      </div>
    ) : null;
  }
}
